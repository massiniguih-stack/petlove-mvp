'use client'

import { ForgotPassword } from '@/components/auth/ForgotPassword'
import Link from 'next/link'
import { useState, useEffect } from 'react'

function LockIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

export default function RecuperarSenhaPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-pink-400/10 to-rose-400/10 blur-3xl" />
      </div>

      <main className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 opacity-20 blur-2xl" />
                <div className="relative rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-xl ring-1 ring-amber-100/50">
                  <LockIcon />
                </div>
              </div>
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900">
              Esqueceu a senha?
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Informe seu email para redefinir
            </p>
          </div>

          <div className="rounded-3xl bg-white/80 p-8 shadow-2xl shadow-slate-200/50 ring-1 ring-slate-200/60 backdrop-blur-sm">
            <ForgotPassword />
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-600"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Voltar para o login
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
