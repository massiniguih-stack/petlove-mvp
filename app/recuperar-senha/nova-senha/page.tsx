'use client'

import { NewPassword } from '@/components/auth/NewPassword'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShieldIcon3D } from '@/components/Icons3D'

export default function NovaSenhaPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-pink-400/10 to-rose-400/10 blur-3xl" />
      </div>

      <main className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-25 blur-2xl" />
                <div className="relative flex items-center justify-center p-2">
                  <ShieldIcon3D size={88} />
                </div>
              </div>
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Nova senha
            </h1>
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
              Crie uma senha forte e segura
            </p>
          </div>

          <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 p-8 shadow-2xl shadow-slate-200/50 ring-1 ring-slate-200/60 dark:ring-slate-800 backdrop-blur-sm">
            <NewPassword />
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 dark:text-slate-500 transition hover:text-slate-600 dark:hover:text-slate-400"
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
