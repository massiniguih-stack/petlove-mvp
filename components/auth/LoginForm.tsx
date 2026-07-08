'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)
    if (error) {
      setError(error === 'Invalid login credentials' ? 'Email ou senha inválidos' : error)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="animate-slide-up">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <span className="text-lg">📧</span> Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={254}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:scale-[1.01]"
          placeholder="seu@email.com"
        />
      </div>

      <div className="animate-slide-up-delay-1">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <span className="text-lg">🔒</span> Senha
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          maxLength={128}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:scale-[1.01]"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="animate-scale-in rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 ring-1 ring-red-100">
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
        <Link href="/recuperar-senha" className="text-sm font-medium text-slate-500 hover:text-amber-600 transition-colors duration-200">
          Esqueceu a senha?
        </Link>
      </div>
    </form>
  )
}
