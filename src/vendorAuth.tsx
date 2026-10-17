import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

/** Prototype only: credentials live in the client. Real sign-in belongs to Supabase Auth. */
export const DEMO_ACCOUNT = { phone: '0901234567', password: 'quanhta', vendorSlug: 'tiem-banh-nha-may', ownerName: 'Chị Mây' }

type Session = { vendorSlug: string, ownerName: string }

type VendorAuthValue = {
  session: Session | null
  signIn: (phone: string, password: string) => boolean
  signOut: () => void
}

const STORAGE_KEY = 'quanhta-vendor-session'
const VendorAuthContext = createContext<VendorAuthValue | null>(null)

const digitsOnly = (value: string) => value.replace(/\D/g, '')

function readStored(): Session | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) as Session : null
  } catch {
    return null
  }
}

export function VendorAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(readStored)

  useEffect(() => {
    try {
      if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Without storage the session simply ends with the tab.
    }
  }, [session])

  const value = useMemo<VendorAuthValue>(() => ({
    session,
    signIn: (phone, password) => {
      const matches = digitsOnly(phone) === DEMO_ACCOUNT.phone && password === DEMO_ACCOUNT.password
      if (matches) setSession({ vendorSlug: DEMO_ACCOUNT.vendorSlug, ownerName: DEMO_ACCOUNT.ownerName })
      return matches
    },
    signOut: () => setSession(null),
  }), [session])

  return <VendorAuthContext.Provider value={value}>{children}</VendorAuthContext.Provider>
}

export function useVendorAuth() {
  const context = useContext(VendorAuthContext)
  if (!context) throw new Error('useVendorAuth must be used inside VendorAuthProvider')
  return context
}

export const formatPhone = (phone: string) => digitsOnly(phone).replace(/^(\d{4})(\d{3})(\d+)$/, '$1 $2 $3')
