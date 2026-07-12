import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Telas que exigem conta logada
const protectedRoutes = [
  '/dashboard',
  '/onboarding',
  '/mapa',
  '/racao',
  '/atividades',
  '/vida',
  '/desempenho',
  '/conta',
]
const adminRoutes = ['/admin']
const adminEmails = (process.env.ADMIN_EMAILS || 'massini.guih@gmail.com').split(',')
const authRoutes = [
  '/login',
  '/cadastro',
  '/verificar-email',
  '/recuperar-senha',
  '/recuperar-senha/nova-senha',
]

export async function middleware(request: NextRequest) {
  const { response, isLoggedIn, email } = await updateSession(request)
  const path = request.nextUrl.pathname

  // Já logado nas telas de auth → manda para o app (dashboard redireciona se faltar pet)
  if (authRoutes.includes(path) && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (adminRoutes.some((r) => path.startsWith(r))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (!email || !adminEmails.includes(email)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  const needsAuth =
    protectedRoutes.includes(path) ||
    protectedRoutes.some((r) => r !== '/' && path.startsWith(`${r}/`))

  if (needsAuth && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
