import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { maxQtyOf, productById, type Product, type Unit } from './catalog'

export type BagLine = { productId: number, unitIndex: number, qty: number }

type Bags = Record<string, BagLine[]>

type BagContextValue = {
  bags: Bags
  setBags: (update: (bags: Bags) => Bags) => void
}

const STORAGE_KEY = 'quanhta-bags-v2'
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

  const qtyIn = (current: BagLine[], productId: number) =>
    current.filter(line => line.productId === productId).reduce((sum, line) => sum + line.qty, 0)
  const limitOf = (productId: number) => {
    const product = productById.get(productId)
    return product ? maxQtyOf(product) : 0
  }

  return {
    lines: resolved,
    count: resolved.reduce((sum, line) => sum + line.qty, 0),
    total: resolved.reduce((sum, line) => sum + line.lineTotal, 0),
    qtyOfProduct: (productId: number) => qtyIn(lines, productId),
    /** How many more of this product fit under its per-order limit. */
    roomFor: (productId: number) => Math.max(0, limitOf(productId) - qtyIn(lines, productId)),
    add: (productId: number, unitIndex: number, qty: number) => update(current => {
      const allowed = Math.min(qty, limitOf(productId) - qtyIn(current, productId))
      if (allowed <= 0) return current
      return current.some(sameLine(productId, unitIndex))
        ? current.map(line => sameLine(productId, unitIndex)(line) ? { ...line, qty: line.qty + allowed } : line)
        : [...current, { productId, unitIndex, qty: allowed }]
    }),
    /** Takes one away from the smallest size of this product in the bag. */
    removeOne: (productId: number) => update(current => {
      const target = current
        .filter(line => line.productId === productId)
        .sort((a, b) => a.unitIndex - b.unitIndex)[0]
      return target ? current.map(line => line === target ? { ...line, qty: line.qty - 1 } : line) : current
    }),
    setQty: (productId: number, unitIndex: number, qty: number) => update(current => {
      const others = qtyIn(current, productId) - (current.find(sameLine(productId, unitIndex))?.qty ?? 0)
      const capped = Math.min(qty, limitOf(productId) - others)
      return current.map(line => sameLine(productId, unitIndex)(line) ? { ...line, qty: capped } : line)
    }),
    clear: () => update(() => []),
  }
}
