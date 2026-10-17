import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { countByCategory, products as baseProducts, type Product } from './catalog'

/** Vendors that have edited their catalogue; everyone else sells the shared demo catalogue. */
type Inventories = Record<string, Product[]>

type InventoryContextValue = {
  inventories: Inventories
  setInventories: (update: (current: Inventories) => Inventories) => void
  /** The latest change couldn't be written to storage (usually full because of photos). */
  persistFailed: boolean
}

const STORAGE_KEY = 'quanhta-inventory-v1'
const InventoryContext = createContext<InventoryContextValue | null>(null)

function readStored(): Inventories {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) as Inventories : {}
  } catch {
    return {}
  }
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventories, setInventories] = useState<Inventories>(readStored)
  const [persistFailed, setPersistFailed] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventories))
      setPersistFailed(false)
    } catch {
      // Edits still last for this visit; the vendor page warns that they won't survive a reload.
      setPersistFailed(true)
    }
  }, [inventories])

  const value = useMemo(() => ({ inventories, setInventories, persistFailed }), [inventories, persistFailed])
  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

function useInventoryContext() {
  const context = useContext(InventoryContext)
  if (!context) throw new Error('Inventory hooks must be used inside InventoryProvider')
  return context
}

/** A vendor's products as the storefront sees them. */
export function useCatalog(vendorSlug: string) {
  const { inventories } = useInventoryContext()
  const all = inventories[vendorSlug] ?? baseProducts
  return useMemo(() => {
    const listed = all.filter(product => !product.hidden)
    return {
      all,
      listed,
      byId: new Map(all.map(product => [product.id, product])),
      counts: countByCategory(listed),
    }
  }, [all])
}

export function useInventoryEditor(vendorSlug: string) {
  const { inventories, setInventories, persistFailed } = useInventoryContext()
  const change = (update: (list: Product[]) => Product[]) =>
    setInventories(current => ({ ...current, [vendorSlug]: update(current[vendorSlug] ?? baseProducts) }))

  return {
    isCustomised: vendorSlug in inventories,
    persistFailed,
    save: (product: Product) => change(list =>
      list.some(item => item.id === product.id)
        ? list.map(item => item.id === product.id ? product : item)
        : [product, ...list]),
    remove: (id: number) => change(list => list.filter(item => item.id !== id)),
    setHidden: (id: number, hidden: boolean) => change(list => list.map(item => item.id === id ? { ...item, hidden } : item)),
    nextId: () => Math.max(0, ...(inventories[vendorSlug] ?? baseProducts).map(item => item.id)) + 1,
    reset: () => setInventories(current => {
      const { [vendorSlug]: _removed, ...rest } = current
      return rest
    }),
  }
}
