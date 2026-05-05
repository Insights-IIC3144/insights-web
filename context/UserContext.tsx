'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { UserProfile } from '@/types/shared'

interface UserContextValue {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
}

const UserContext = createContext<UserContextValue>({
  profile: null,
  isLoading: true,
  error: null,
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchProfile() {
      try {
        const res = await fetch('/api/users/me')
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data: UserProfile = await res.json()
        if (!cancelled) setProfile(data)
      } catch (err) {
        if (!cancelled) setError('No se pudo cargar el perfil')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchProfile()
    return () => { cancelled = true }
  }, []) 

  return (
    <UserContext.Provider value={{ profile, isLoading, error }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  return useContext(UserContext)
}