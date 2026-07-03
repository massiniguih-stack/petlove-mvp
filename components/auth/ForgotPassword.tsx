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
      <div className="text-center space-y-4">
        <div className="text-6xl">✉️</div>
        <h2 className="text-2xl font-bold text-gray-800">Email enviado</h2>
        <p className="text-gray-600">
          Verifique sua caixa de entrada e clique no link para redefinir sua senha.
        </p>
        <Link href="/login" className="inline-block text-orange-500 hover:underline">
          Voltar para o login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
          placeholder="seu@email.com"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 text-white font-medium py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Enviar link de recuperação'}
      </button>

      <div className="text-center">
        <Link href="/login" className="text-orange-500 text-sm hover:underline">
          Voltar para o login
        </Link>
      </div>
    </form>
  )
}
