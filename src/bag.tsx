import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { productById, type Product, type Unit } from './data'

export type BagLine = { productId: number, unitIndex: number, qty: number }

type Bags = Record<string, BagLine[]>

type BagContextValue = {
  bags: Bags
  setBags: (update: (bags: Bags) => Bags) => void
}

const STORAGE_KEY = 'neighbourhood-bags'
const BagContext = createContext<BagContextValue | null>(null)

function readStoredBags(): Bags {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) as Bags : {}
  } catch {
    return {}
  }
}

export function BagProvider({ children }: { children: ReactNode }) {
  const [bags, setBagsState] = useState<Bags>(readStoredBags)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bags))
    } catch {
      // Private browsing can block storage; the bag still works for this visit.
    }
  }, [bags])

  const value = useMemo(() => ({ bags, setBags: setBagsState }), [bags])
  return <BagContext.Provider value={value}>{children}</BagContext.Provider>
}

export type ResolvedLine = BagLine & { product: Product, unit: Unit, lineTotal: number }

// Orders are placed per shop, so each vendor has its own bag.
export function useBag(vendorSlug: string) {
  const context = useContext(BagContext)
  if (!context) throw new Error('useBag must be used inside BagProvider')
  const { bags, setBags } = context
  const lines = bags[vendorSlug] ?? []

  const resolved: ResolvedLine[] = lines.flatMap(line => {
    const product = productById.get(line.productId)
    const unit = product?.units[line.unitIndex]
    return product && unit ? [{ ...line, product, unit, lineTotal: unit.price * line.qty }] : []
  })

  const update = (change: (lines: BagLine[]) => BagLine[]) =>
    setBags(all => ({ ...all, [vendorSlug]: change(all[vendorSlug] ?? []).filter(line => line.qty > 0) }))

  const sameLine = (productId: number, unitIndex: number) => (line: BagLine) =>
    line.productId === productId && line.unitIndex === unitIndex

  return {
    lines: resolved,
    count: resolved.reduce((sum, line) => sum + line.qty, 0),
    total: resolved.reduce((sum, line) => sum + line.lineTotal, 0),
    qtyOfProduct: (productId: number) =>
      resolved.filter(line => line.productId === productId).reduce((sum, line) => sum + line.qty, 0),
    add: (productId: number, unitIndex: number, qty: number) => update(current =>
      current.some(sameLine(productId, unitIndex))
        ? current.map(line => sameLine(productId, unitIndex)(line) ? { ...line, qty: line.qty + qty } : line)
        : [...current, { productId, unitIndex, qty }]),
    setQty: (productId: number, unitIndex: number, qty: number) => update(current =>
      current.map(line => sameLine(productId, unitIndex)(line) ? { ...line, qty } : line)),
    clear: () => update(() => []),
  }
}
