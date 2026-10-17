import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { neighbourhoodById, neighbourhoods, type Neighbourhood } from './data'

type Stored = { currentId: string, joined: string[] }

type NeighbourhoodContextValue = {
  current: Neighbourhood
  setCurrent: (id: string) => void
  isJoined: (id: string) => boolean
  join: (id: string) => void
  memberCount: (neighbourhood: Neighbourhood) => number
}

const STORAGE_KEY = 'quanhta-neighbourhood'
const NeighbourhoodContext = createContext<NeighbourhoodContextValue | null>(null)

function readStored(): Stored {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Stored | null
    if (stored && neighbourhoodById(stored.currentId)) return stored
  } catch {
    // Fall through to the default neighbourhood.
  }
  return { currentId: neighbourhoods[0].id, joined: [] }
}

export function NeighbourhoodProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Stored>(readStored)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Private browsing can block storage; the choice still applies for this visit.
    }
  }, [state])

  const value = useMemo<NeighbourhoodContextValue>(() => ({
    current: neighbourhoodById(state.currentId) ?? neighbourhoods[0],
    setCurrent: id => setState(previous => ({ ...previous, currentId: id })),
    isJoined: id => state.joined.includes(id),
    join: id => setState(previous => previous.joined.includes(id) ? previous : { ...previous, joined: [...previous.joined, id] }),
    memberCount: neighbourhood => neighbourhood.members + (state.joined.includes(neighbourhood.id) ? 1 : 0),
  }), [state])

  return <NeighbourhoodContext.Provider value={value}>{children}</NeighbourhoodContext.Provider>
}

export function useNeighbourhood() {
  const context = useContext(NeighbourhoodContext)
  if (!context) throw new Error('useNeighbourhood must be used inside NeighbourhoodProvider')
  return context
}
