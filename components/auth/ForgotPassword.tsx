'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/recuperar-senha/callback`
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="animate-fade-in text-center space-y-4">
        <div className="text-6xl">✉️</div>
        <h2 className="text-2xl font-bold text-slate-900">Email enviado</h2>
        <p className="text-slate-600">
          Verifique sua caixa de entrada e clique no link para redefinir sua senha.
        </p>
        <Link href="/login" className="inline-block font-semibold text-amber-600 hover:text-amber-700 transition">
          Voltar para o login
        </Link>
      </div>
    )
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

      {error && (
        <div className="animate-scale-in rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 ring-1 ring-red-100">
          {error}
        </div>
      )}

      <div className="animate-slide-up-delay-1">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? 'Enviando...' : '📨 Enviar link'}
        </button>
      </div>

      <div className="animate-slide-up-delay-2 text-center">
        <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-amber-600 transition-colors duration-200">
          Voltar para o login
        </Link>
      </div>
    </form>
  )
}
