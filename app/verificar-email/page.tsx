'use client'

import { EmailVerification } from '@/components/auth/EmailVerification'
import Link from 'next/link'
import { useState, useEffect } from 'react'

function MailIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}

export default function VerificarEmailPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950">
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
                  <MailIcon />
                </div>
              </div>
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Verifique seu email
            </h1>
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
              Enviamos um link de confirmação
            </p>
          </div>

          <div className="rounded-3xl bg-white/80 p-8 shadow-2xl shadow-slate-200/50 ring-1 ring-slate-200/60 backdrop-blur-sm dark:bg-slate-900/80 dark:ring-slate-700/60">
            <EmailVerification />
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
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
