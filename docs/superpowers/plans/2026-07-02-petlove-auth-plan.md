# PetLove MVP — Autenticação Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement complete authentication system for PetLove MVP with Supabase Auth (email/senha + Google), email verification, password recovery, and route protection.

**Architecture:** Supabase Auth handles authentication, a trigger auto-creates tutor profiles, RLS ensures data isolation, and Next.js middleware protects routes.

**Tech Stack:** Next.js 14, Supabase Auth, @supabase/ssr, React Context, Tailwind CSS

## Global Constraints

- Next.js App Router (not Pages Router)
- Supabase Auth for all authentication
- RLS enabled on all tables
- Mobile-first responsive design
- All UI text in Portuguese (Brazil)
- TypeScript strict mode

---

## File Structure

```
petlove-mvp/
├── app/
│   ├── login/page.tsx                    (new)
│   ├── cadastro/page.tsx                 (new)
│   ├── verificar-email/page.tsx          (new)
│   ├── recuperar-senha/page.tsx          (new)
│   ├── layout.tsx                        (modify)
│   └── page.tsx                          (modify - add auth check)
├── components/
│   └── auth/
│       ├── LoginForm.tsx                 (new)
│       ├── SignupForm.tsx                 (new)
│       ├── GoogleButton.tsx              (new)
│       ├── EmailVerification.tsx         (new)
│       └── ForgotPassword.tsx            (new)
├── lib/
│   └── supabase/
│       ├── client.ts                     (new)
│       ├── server.ts                     (new)
│       └── middleware.ts                 (new)
├── providers/
│   └── AuthProvider.tsx                  (new)
├── middleware.ts                          (new)
├── supabase/
│   └── schema.sql                        (modify)
└── .env.local                            (modify)
```

---

### Task 1: Supabase Clients

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`

**Interfaces:**
- Consumes: Environment variables NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- Produces: `createClient()` for browser, `createClient()` for server, `updateSession()` for middleware

- [ ] **Step 1: Create browser client**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create server client**

```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server component, can't set cookies
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server component, can't delete cookies
          }
        },
      },
    }
  )
}
```

- [ ] **Step 3: Create middleware helper**

```typescript
// lib/supabase/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/
git commit -m "feat: add supabase clients for browser, server, and middleware"
```

---

### Task 2: AuthProvider Context

**Files:**
- Create: `providers/AuthProvider.tsx`
- Create: `hooks/useAuth.ts`

**Interfaces:**
- Consumes: `createClient()` from `lib/supabase/client`
- Produces: `AuthProvider` component, `useAuth()` hook with `{ user, session, loading, signIn, signUp, signOut, signInWithGoogle }`

- [ ] **Step 1: Create AuthProvider**

```typescript
// providers/AuthProvider.tsx
'use client'

import { createContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, metadata?: Record<string, string>) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error?: string }>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const setData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    setData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, string>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    if (error) return { error: error.message }
    return {}
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) return { error: error.message }
    return {}
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}
```

- [ ] **Step 2: Create useAuth hook**

```typescript
// hooks/useAuth.ts
'use client'

import { useContext } from 'react'
import { AuthContext } from '@/providers/AuthProvider'

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

- [ ] **Step 3: Commit**

```bash
git add providers/AuthProvider.tsx hooks/useAuth.ts
git commit -m "feat: add AuthProvider context and useAuth hook"
```

---

### Task 3: Google OAuth Callback

**Files:**
- Create: `app/auth/callback/route.ts`

**Interfaces:**
- Consumes: `createClient()` from `lib/supabase/server`
- Produces: Redirects to `/dashboard` on success, `/login` on error

- [ ] **Step 1: Create callback route**

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
```

- [ ] **Step 2: Commit**

```bash
git add app/auth/callback/
git commit -m "feat: add Google OAuth callback route"
```

---

### Task 4: Middleware

**Files:**
- Create: `middleware.ts`

**Interfaces:**
- Consumes: `updateSession()` from `lib/supabase/middleware`
- Produces: Route protection logic

- [ ] **Step 1: Create middleware**

```typescript
// middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const protectedRoutes = ['/dashboard', '/mapa', '/racao']
const authRoutes = ['/login', '/cadastro', '/verificar-email', '/recuperar-senha']

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const path = request.nextUrl.pathname

  // Get session from response cookies
  const sessionCookie = response.cookies.get('sb-access-token')
  const isLoggedIn = !!sessionCookie

  // Redirect logged in users away from auth routes
  if (authRoutes.includes(path) && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users to login
  if (protectedRoutes.includes(path) && !isLoggedIn) {
    return Response.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add middleware for route protection"
```

---

### Task 5: Auth Components

**Files:**
- Create: `components/auth/GoogleButton.tsx`
- Create: `components/auth/LoginForm.tsx`
- Create: `components/auth/SignupForm.tsx`
- Create: `components/auth/EmailVerification.tsx`
- Create: `components/auth/ForgotPassword.tsx`

**Interfaces:**
- Consumes: `useAuth()` hook
- Produces: Reusable auth UI components

- [ ] **Step 1: Create GoogleButton**

```typescript
// components/auth/GoogleButton.tsx
'use client'

import { useAuth } from '@/hooks/useAuth'

export function GoogleButton() {
  const { signInWithGoogle } = useAuth()

  return (
    <button
      onClick={() => signInWithGoogle()}
      className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-3 font-medium hover:bg-gray-50 transition-colors"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continuar com Google
    </button>
  )
}
```

- [ ] **Step 2: Create LoginForm**

```typescript
// components/auth/LoginForm.tsx
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

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
          placeholder="••••••••"
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
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <div className="text-center">
        <Link href="/recuperar-senha" className="text-orange-500 text-sm hover:underline">
          Esqueceu a senha?
        </Link>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Create SignupForm**

```typescript
// components/auth/SignupForm.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export function SignupForm() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    telefone: '',
    endereco: '',
    cidade: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signUp(formData.email, formData.password, {
      nome: formData.nome,
      telefone: formData.telefone,
      endereco: formData.endereco,
      cidade: formData.cidade
    })

    if (error) {
      setError(error === 'User already registered' ? 'Este email já está cadastrado' : error)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
          Nome completo
        </label>
        <input
          id="nome"
          name="nome"
          type="text"
          value={formData.nome}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
          placeholder="Seu nome"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
          Telefone
        </label>
        <input
          id="telefone"
          name="telefone"
          type="tel"
          value={formData.telefone}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
          placeholder="(11) 99999-9999"
        />
      </div>

      <div>
        <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
          Endereço
        </label>
        <input
          id="endereco"
          name="endereco"
          type="text"
          value={formData.endereco}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
          placeholder="Rua, número, bairro"
        />
      </div>

      <div>
        <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
          Cidade
        </label>
        <input
          id="cidade"
          name="cidade"
          type="text"
          value={formData.cidade}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
          placeholder="São Paulo"
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
        {loading ? 'Cadastrando...' : 'Cadastrar'}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Create EmailVerification**

```typescript
// components/auth/EmailVerification.tsx
import Link from 'next/link'

export function EmailVerification() {
  return (
    <div className="text-center space-y-4">
      <div className="text-6xl">📧</div>
      <h2 className="text-2xl font-bold text-gray-800">Verifique seu email</h2>
      <p className="text-gray-600">
        Enviamos um link de verificação para o seu email.
        <br />
        Clique no link para ativar sua conta.
      </p>
      <p className="text-sm text-gray-500">
        Não recebeu? Verifique sua caixa de spam.
      </p>
      <Link
        href="/login"
        className="inline-block text-orange-500 hover:underline"
      >
        Voltar para o login
      </Link>
    </div>
  )
}
```

- [ ] **Step 5: Create ForgotPassword**

```typescript
// components/auth/ForgotPassword.tsx
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
```

- [ ] **Step 6: Commit**

```bash
git add components/auth/
git commit -m "feat: add auth components (LoginForm, SignupForm, GoogleButton, EmailVerification, ForgotPassword)"
```

---

### Task 6: Auth Pages

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/cadastro/page.tsx`
- Create: `app/verificar-email/page.tsx`
- Create: `app/recuperar-senha/page.tsx`

**Interfaces:**
- Consumes: Auth components from `components/auth/`
- Produces: Complete auth pages

- [ ] **Step 1: Create login page**

```typescript
// app/login/page.tsx
import { LoginForm } from '@/components/auth/LoginForm'
import { GoogleButton } from '@/components/auth/GoogleButton'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🐕 PetLove</h1>
          <p className="text-gray-600 mt-2">Bem-vindo de volta!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <LoginForm />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <GoogleButton />

          <p className="text-center mt-6 text-sm text-gray-600">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-orange-500 hover:underline font-medium">
              Cadastrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create cadastro page**

```typescript
// app/cadastro/page.tsx
import { SignupForm } from '@/components/auth/SignupForm'
import { GoogleButton } from '@/components/auth/GoogleButton'
import Link from 'next/link'

export default function CadastroPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🐕 PetLove</h1>
          <p className="text-gray-600 mt-2">Crie sua conta</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <SignupForm />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <GoogleButton />

          <p className="text-center mt-6 text-sm text-gray-600">
            Já tem conta?{' '}
            <Link href="/login" className="text-orange-500 hover:underline font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create verificar-email page**

```typescript
// app/verificar-email/page.tsx
import { EmailVerification } from '@/components/auth/EmailVerification'

export default function VerificarEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🐕 PetLove</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <EmailVerification />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create recuperar-senha page**

```typescript
// app/recuperar-senha/page.tsx
import { ForgotPassword } from '@/components/auth/ForgotPassword'

export default function RecuperarSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🐕 PetLove</h1>
          <p className="text-gray-600 mt-2">Redefina sua senha</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <ForgotPassword />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/login/ app/cadastro/ app/verificar-email/ app/recuperar-senha/
git commit -m "feat: add auth pages (login, cadastro, verificar-email, recuperar-senha)"
```

---

### Task 7: Update Layout and Schema

**Files:**
- Modify: `app/layout.tsx`
- Modify: `supabase/schema.sql`
- Modify: `.env.local`

**Interfaces:**
- Consumes: `AuthProvider` from `providers/AuthProvider`
- Produces: App wrapped with auth, updated schema, env vars

- [ ] **Step 1: Update layout.tsx**

```typescript
// app/layout.tsx
import { AuthProvider } from '@/providers/AuthProvider'
import './globals.css'

export const metadata = {
  title: 'PetLove - Cuidados para seu pet',
  description: 'Encontre os melhores serviços para seu animal de estimação',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Update schema.sql**

```sql
-- PetLove MVP - Schema com Supabase Auth

-- Tabela de tutor (atualizada para Supabase Auth)
create table public.tutor (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  telefone text,
  endereco text,
  cidade text,
  consentimento_marketing boolean default false,
  consentimento_localizacao boolean default false,
  data_exclusao timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Tabela de pets
create table public.pet (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid references public.tutor(id) on delete cascade not null,
  nome text not null,
  raca text not null,
  data_nascimento date not null,
  sexo text not null check (sexo in ('macho','femea')),
  peso_atual numeric not null,
  foto_url text,
  fase_vida text not null default 'filhote',
  objetivo text not null default 'manutencao',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Histórico de peso
create table public.peso_historico (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pet(id) on delete cascade not null,
  data timestamp default now() not null,
  peso numeric not null,
  medidas jsonb
);

-- Vacinas
create table public.vacina (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pet(id) on delete cascade not null,
  tipo text not null,
  data_aplicacao date not null,
  proxima_data date,
  veterinario_id uuid,
  created_at timestamp default now()
);

-- Serviços
create table public.servico (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('veterinario','parque','hotel','creche','pet_sitter')),
  nome text not null,
  endereco text not null,
  bairro text,
  cidade text not null,
  estado text not null,
  lat numeric,
  lng numeric,
  avaliacao numeric,
  telefone text,
  site text,
  created_at timestamp default now()
);

-- Recomendações de ração
create table public.recomendacao_racao (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid references public.pet(id) on delete cascade not null,
  tipo text not null,
  objetivo text not null,
  detalhes jsonb not null,
  data timestamp default now() not null
);

-- Trigger para criar tutor automaticamente
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.tutor (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS (Row Level Security)
alter table public.tutor enable row level security;
alter table public.pet enable row level security;
alter table public.peso_historico enable row level security;
alter table public.vacina enable row level security;
alter table public.servico enable row level security;
alter table public.recomendacao_racao enable row level security;

-- Políticas RLS
create policy "tutor_select_own" on public.tutor
  for select using (auth.uid() = id);

create policy "tutor_update_own" on public.tutor
  for update using (auth.uid() = id);

create policy "pet_select_own" on public.pet
  for select using (auth.uid() = tutor_id);

create policy "pet_insert_own" on public.pet
  for insert with check (auth.uid() = tutor_id);

create policy "pet_update_own" on public.pet
  for update using (auth.uid() = tutor_id);

create policy "pet_delete_own" on public.pet
  for delete using (auth.uid() = tutor_id);

create policy "servico_read_all" on public.servico
  for select using (true);
```

- [ ] **Step 3: Create .env.local**

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx supabase/schema.sql .env.local
git commit -m "feat: update layout with AuthProvider, schema with trigger and RLS"
```

---

### Task 8: Install Dependencies and Test

**Files:**
- Modify: `package.json`

**Interfaces:**
- Consumes: None
- Produces: Working authentication system

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/guilhermemassini/Projetos/petlove-mvp
npm install @supabase/ssr
```

- [ ] **Step 2: Run development server**

```bash
npm run dev
```

- [ ] **Step 3: Test login page**

Open http://localhost:3000/login and verify:
- Form renders correctly
- Google button appears
- Links work

- [ ] **Step 4: Test cadastro page**

Open http://localhost:3000/cadastro and verify:
- All form fields render
- Form submits (will fail without Supabase, but UI works)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @supabase/ssr dependency"
```

---

## Checklist de Implementação

- [x] Task 1: Supabase Clients
- [x] Task 2: AuthProvider Context
- [x] Task 3: Google OAuth Callback
- [x] Task 4: Middleware
- [x] Task 5: Auth Components
- [x] Task 6: Auth Pages
- [x] Task 7: Update Layout and Schema
- [x] Task 8: Install Dependencies and Test

## Critérios de Aceite

- [ ] Usuário consegue cadastrar com email/senha
- [ ] Usuário consegue cadastrar com Google
- [ ] Email de verificação é enviado automaticamente
- [ ] Usuário só acessa após verificar email (email/senha)
- [ ] Login com Google funciona sem verificação
- [ ] Recuperação de senha funciona
- [ ] Rotas protegidas redirecionam para login
- [ ] Usuário logado não acessa login/cadastro
- [ ] RLS garante acesso apenas aos próprios dados
- [ ] Layout responsivo (mobile-first)
- [ ] Mensagens de erro em português
- [ ] Loading states em todos os formulários
