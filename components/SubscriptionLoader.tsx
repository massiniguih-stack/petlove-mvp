'use client'

import { useEffect } from 'react'
import { usePetStore } from '@/lib/store'

export function SubscriptionLoader({ children }: { children: React.ReactNode }) {
  const hydrate = usePetStore((s) => s.hydrate)
  const fetchSubscription = usePetStore((s) => s.fetchSubscription)
  const fetchPets = usePetStore((s) => s.fetchPets)

  useEffect(() => {
    hydrate()
    fetchSubscription()
    fetchPets()
  }, [])

  return <>{children}</>
}
