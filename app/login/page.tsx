'use client'

import { LoginForm } from '@/components/auth/LoginForm'
import { GoogleButton } from '@/components/auth/GoogleButton'
import Link from 'next/link'
import { useState, useEffect } from 'react'

function DogPawIcon({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="pawGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
      </defs>
      <ellipse cx="20" cy="18" rx="6" ry="7" fill="url(#pawGrad)"/>
      <ellipse cx="44" cy="18" rx="6" ry="7" fill="url(#pawGrad)"/>
      <ellipse cx="12" cy="32" rx="5" ry="6" fill="url(#pawGrad)"/>
      <ellipse cx="52" cy="32" rx="5" ry="6" fill="url(#pawGrad)"/>
      <ellipse cx="32" cy="44" rx="14" ry="12" fill="url(#pawGrad)"/>
    </svg>
  )
}

export default function LoginPage() {
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
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-pink-400/10 to-rose-400/10 blur-3xl" />
      </div>

      <main className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 opacity-20 blur-2xl" />
                <div className="relative rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-xl ring-1 ring-amber-100/50">
                  <DogPawIcon size={56} />
                </div>
              </div>
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Pet</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-600">Love</span>
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-400">
              Bem-vindo de volta! 🐾
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-3xl bg-white/80 p-8 shadow-2xl shadow-slate-200/50 ring-1 ring-slate-200/60 backdrop-blur-sm">
            <LoginForm />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white/80 px-3 text-xs font-medium text-slate-400">ou continue com</span>
              </div>
            </div>

            <GoogleButton />

            <p className="mt-6 text-center text-sm text-slate-500">
              Não tem conta?{' '}
              <Link
                href="/cadastro"
                className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 transition hover:from-amber-600 hover:to-orange-600"
              >
                Criar agora
              </Link>
            </p>
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-600"
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
