import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const protectedRoutes = ['/dashboard', '/mapa', '/racao']
const authRoutes = ['/login', '/cadastro', '/verificar-email', '/recuperar-senha']

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const path = request.nextUrl.pathname

  const sessionCookie = response.cookies.get('sb-access-token')
  const isLoggedIn = !!sessionCookie

  if (authRoutes.includes(path) && isLoggedIn) {
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.getAll().forEach(c => redirectResponse.cookies.set(c))
    return redirectResponse
  }

  if (protectedRoutes.includes(path) && !isLoggedIn) {
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.getAll().forEach(c => redirectResponse.cookies.set(c))
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
