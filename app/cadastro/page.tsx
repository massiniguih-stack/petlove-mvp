'use client'

import { SignupForm } from '@/components/auth/SignupForm'
import { GoogleButton } from '@/components/auth/GoogleButton'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { PawIcon3D } from '@/components/Icons3D'

export default function CadastroPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-pink-400/20 to-rose-400/20 blur-3xl dark:from-pink-400/10 dark:to-rose-400/10" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-amber-400/10 to-orange-400/10 blur-3xl dark:from-amber-400/5 dark:to-orange-400/5" />
      </div>

      <DarkModeToggle />

      <main className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 opacity-25 blur-2xl" />
                <div className="relative flex items-center justify-center p-2">
                  <PawIcon3D size={88} />
                </div>
              </div>
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-600">Patinha</span>
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              Passo 1 de 2 · grátis · sem cartão
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Depois você cadastra o pet e já usa o app
            </p>
          </div>

          {/* Signup Card */}
          <div className="rounded-3xl bg-white/80 p-8 shadow-2xl shadow-slate-200/50 ring-1 ring-slate-200/60 backdrop-blur-sm dark:bg-slate-900/80 dark:shadow-slate-900/50 dark:ring-slate-800/60">
            <SignupForm />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white/80 px-3 text-xs font-medium text-slate-400 dark:bg-slate-900/80">ou cadastre-se com</span>
              </div>
            </div>

            <GoogleButton />

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Já tem conta?{' '}
              <Link
                href="/login"
                className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 transition hover:from-amber-600 hover:to-orange-600"
              >
                Entrar
              </Link>
            </p>
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Voltar para o início
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
