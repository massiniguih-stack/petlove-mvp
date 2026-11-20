'use client'

import { useEffect, useRef } from 'react'
import { usePetStore } from '@/lib/store'
import { useAuth } from '@/hooks/useAuth'
import { deveReconsultarAssinatura } from '@/lib/assinatura'

export function SubscriptionLoader({ children }: { children: React.ReactNode }) {
  const hydrate = usePetStore((s) => s.hydrate)
  const fetchSubscription = usePetStore((s) => s.fetchSubscription)
  const fetchPets = usePetStore((s) => s.fetchPets)
  const { user, loading } = useAuth()
  // Quando foi a última vez que perguntamos ao servidor sobre a assinatura.
  const ultimaConsulta = useRef<number | null>(null)

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
    ultimaConsulta.current = Date.now()
    fetchSubscription()
    fetchPets()
  }, [user?.id, loading])

  // O pagamento é confirmado pela LastLink em segundo plano (webhook), muitas
  // vezes enquanto o tutor está em outra aba ou no app do banco. Quando ele
  // volta para o Patinha, pergunta de novo se virou Premium — senão a tela
  // continuaria oferecendo "Mudar de plano" até um recarregamento.
  useEffect(() => {
    if (loading || !user) return
    const aoVoltar = () => {
      if (document.visibilityState !== 'visible') return
      if (!deveReconsultarAssinatura(ultimaConsulta.current, Date.now())) return
      ultimaConsulta.current = Date.now()
      fetchSubscription()
    }
    document.addEventListener('visibilitychange', aoVoltar)
    window.addEventListener('focus', aoVoltar)
    return () => {
      document.removeEventListener('visibilitychange', aoVoltar)
      window.removeEventListener('focus', aoVoltar)
    }
  }, [user, loading, fetchSubscription])

  return <>{children}</>
}
