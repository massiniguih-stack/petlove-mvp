'use client'

import { useEffect } from 'react'
import { usePetStore } from '@/lib/store'

export function SubscriptionLoader({ children }: { children: React.ReactNode }) {
  const fetchSubscription = usePetStore((s) => s.fetchSubscription)

  useEffect(() => {
    fetchSubscription()
  }, [])

  return <>{children}</>
}
