import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const protectedRoutes = ['/dashboard', '/mapa', '/racao', '/atividades', '/vida', '/desempenho']
const adminRoutes = ['/admin']
const adminEmails = (process.env.ADMIN_EMAILS || 'massini.guih@gmail.com').split(',');
const authRoutes = ['/login', '/cadastro', '/verificar-email', '/recuperar-senha', '/recuperar-senha/nova-senha']

export async function middleware(request: NextRequest) {
  const { response, isLoggedIn, email } = await updateSession(request)
  const path = request.nextUrl.pathname

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

  if (protectedRoutes.includes(path) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
