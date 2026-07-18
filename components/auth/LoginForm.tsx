'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

function safeNextPath(next: string | null): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return null
  return next
}

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await signIn(email, password)
    if (signInError) {
      setError(signInError === 'Invalid login credentials' ? 'Email ou senha inválidos' : signInError)
      setLoading(false)
      return
    }

    // Respeita ?next= (ex.: veio do onboarding); senão vai direto pro
    // dashboard — se a conta não tiver pet cadastrado, o próprio dashboard
    // redireciona pro onboarding assim que carregar os dados reais.
    const destination = safeNextPath(searchParams.get('next')) ?? '/dashboard'
    router.replace(destination)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="animate-slide-up">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
          <span className="text-lg">📧</span> Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={254}
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:scale-[1.01] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          placeholder="seu@email.com"
        />
      </div>

      <div className="animate-slide-up-delay-1">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
          <span className="text-lg">🔒</span> Senha
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          maxLength={128}
          autoComplete="current-password"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:scale-[1.01] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="animate-scale-in rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 ring-1 ring-red-100 dark:bg-red-950 dark:text-red-400 dark:ring-red-900">
          {error}
        </div>
      )}

      <div className="animate-slide-up-delay-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? 'Entrando...' : '🚪 Entrar'}
        </button>
      </div>

      <div className="animate-slide-up-delay-3 text-center">
        <Link href="/recuperar-senha" className="text-sm font-medium text-slate-500 hover:text-amber-600 transition-colors duration-200 dark:text-slate-400 dark:hover:text-amber-400">
          Esqueceu a senha?
        </Link>
      </div>
    </form>
  )
}
