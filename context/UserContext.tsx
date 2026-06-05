'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { UserProfile } from '@/types/shared'

interface UserContextValue {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  days: number
  setDays: (days: number) => void
  selectedBrand: string
  setSelectedBrand: (brand: string) => void
  availableBrands: string[]
}

const UserContext = createContext<UserContextValue>({
  profile: null,
  isLoading: true,
  error: null,
  days: 90,
  setDays: () => {},
  selectedBrand: "",
  setSelectedBrand: () => {},
  availableBrands: [],
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [days, setDays] = useState(90)
  const [selectedBrand, setSelectedBrand] = useState("")
  const [availableBrands, setAvailableBrands] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false

    async function fetchInitialData() {
      try {
        // 1. Obtener el perfil súper rápido (debe tardar milisegundos)
        const res = await fetch('/api/users/me')
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data: UserProfile = await res.json()

        if (cancelled) return
        setProfile(data)

        // 2. Lógica Admin vs Brand
        if (data.role === 'retailer_admin') {
          // El admin empieza viendo TODAS las marcas (string vacío = sin filtro en backend)
          setSelectedBrand("")

          // 3. Cargamos los filtros pesados en SEGUNDO PLANO sin bloquear la UI
          fetch('/api/proxy/filters')
            .then(res => res.json())
            .then(filters => {
              if (!cancelled && filters.brands) {
                setAvailableBrands(filters.brands)
              }
            })
            .catch(err => console.error("Error cargando filtros en segundo plano:", err))

        } else {
          // Es un usuario de marca específica
          const userBrand = data.brand || ""
          setSelectedBrand(userBrand)
          setAvailableBrands(userBrand ? [userBrand] : [])
        }

      } catch (err) {
        if (!cancelled) setError('No se pudo cargar el perfil')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchInitialData()
    return () => { cancelled = true }
  }, [])

  return (
    <UserContext.Provider value={{
      profile, isLoading, error,
      days, setDays, selectedBrand, setSelectedBrand, availableBrands
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  return useContext(UserContext)
}