import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const protectedRoutes = ['/dashboard', '/mapa', '/racao']
const authRoutes = ['/login', '/cadastro', '/verificar-email', '/recuperar-senha']

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const path = request.nextUrl.pathname

  const sessionCookie = response.cookies.get('sb-access-token')
  const isLoggedIn = !!sessionCookie

  if (authRoutes.includes(path) && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', request.url))
  }

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
