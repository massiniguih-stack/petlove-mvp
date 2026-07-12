'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export function SignupForm() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signUpError, hasSession } = await signUp(email, password, { nome })

    if (signUpError) {
      setError(signUpError === 'User already registered' ? 'Este email já está cadastrado' : signUpError)
      setLoading(false)
      return
    }

    if (hasSession) {
      // Conta pronta: próximo passo é cadastrar o pet
      router.replace('/onboarding')
      router.refresh()
      return
    }

    // Precisa confirmar e-mail antes de continuar
    setNeedsEmailConfirm(true)
    setSuccess(true)
    setLoading(false)
  }

  if (success && needsEmailConfirm) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-4xl dark:bg-amber-950">
          📧
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Quase lá!</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Enviamos um link para <strong className="text-slate-900 dark:text-white">{email}</strong>
          </p>
        </div>

        <ol className="space-y-2 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
          <li className="flex gap-2">
            <span className="font-bold text-amber-600">1.</span>
            Abra o e-mail e clique no link de confirmação
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-amber-600">2.</span>
            Você volta ao app automaticamente
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-amber-600">3.</span>
            Cadastre seu pet (leva menos de 1 minuto)
          </li>
        </ol>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Não recebeu? Confira a caixa de spam.
        </p>

        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-xl border-2 border-slate-200 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Já confirmei — quero entrar
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="animate-slide-up">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
          <span className="text-lg">👤</span> Seu nome
        </label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          maxLength={100}
          autoComplete="name"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:scale-[1.01] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          placeholder="Como podemos te chamar?"
        />
      </div>

      <div className="animate-slide-up-delay-1">
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

      <div className="animate-slide-up-delay-2">
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
          autoComplete="new-password"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:scale-[1.01] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          placeholder="Mínimo 6 caracteres"
        />
        <p className="mt-1.5 text-xs text-slate-400">Mínimo de 6 caracteres</p>
      </div>

      {error && (
        <div className="animate-scale-in rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 ring-1 ring-red-100 dark:bg-red-950 dark:text-red-400 dark:ring-red-900">
          {error}
          {error.includes('já está cadastrado') && (
            <p className="mt-2">
              <Link href="/login" className="font-bold underline">
                Entrar com este email
              </Link>
            </p>
          )}
        </div>
      )}

      <div className="animate-slide-up-delay-3">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? 'Criando conta...' : '✨ Criar conta grátis'}
        </button>
        <p className="mt-2 text-center text-xs text-slate-400">
          Depois é só cadastrar seu pet — menos de 1 minuto
        </p>
      </div>
    </form>
  )
}
