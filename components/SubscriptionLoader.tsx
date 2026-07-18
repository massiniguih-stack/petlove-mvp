'use client'

import { useEffect } from 'react'
import { usePetStore } from '@/lib/store'
import { useAuth } from '@/hooks/useAuth'

export function SubscriptionLoader({ children }: { children: React.ReactNode }) {
  const hydrate = usePetStore((s) => s.hydrate)
  const fetchSubscription = usePetStore((s) => s.fetchSubscription)
  const fetchPets = usePetStore((s) => s.fetchPets)
  const { user, loading } = useAuth()

  useEffect(() => {
    hydrate()
  }, [])

  useEffect(() => {
    // Na primeira carga da página, `user` ainda não existe (a sessão está
    // sendo verificada) — pets/assinatura só existem pra buscar depois que
    // alguém está autenticado. Reagir a `user?.id` (em vez de só rodar uma
    // vez no mount) garante que a busca aconteça de novo assim que o login
    // completa, mesmo sem recarregar a página (ex.: LoginForm navega pro
    // /dashboard sem dar reload, então o mount deste componente já tinha
    // passado e a chamada original teria rodado sem sessão nenhuma).
    if (loading || !user) return
    fetchSubscription()
    fetchPets()
  }, [user?.id, loading])

  return <>{children}</>
}
