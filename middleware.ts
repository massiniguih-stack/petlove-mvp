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
  '/parceiro',
]
const adminRoutes = ['/admin']
/** Páginas só de QA/design — não fazem sentido em produção pública. */
const internalOnlyRoutes = ['/conferir', '/preview-icones']
const adminEmails = (process.env.ADMIN_EMAILS || 'massini.guih@gmail.com')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean)
const authRoutes = [
  '/login',
  '/cadastro',
  '/recuperar-senha',
  '/recuperar-senha/nova-senha',
]

export async function middleware(request: NextRequest) {
  const { response, isLoggedIn, email } = await updateSession(request)
  const path = request.nextUrl.pathname

  // Modo revisão local: liberar todas as rotas (sem login).
  // Ativar com OPEN_ACCESS=true no .env.local (também vale com `next start`).
  // NUNCA deixe isso ligado em deploy público.
  const openAccess =
    process.env.OPEN_ACCESS === 'true' || process.env.NEXT_PUBLIC_OPEN_ACCESS === 'true'

  if (openAccess) {
    return response
  }

  // Rotas internas de QA/design: só admin logado (ou OPEN_ACCESS acima)
  if (internalOnlyRoutes.some((r) => path === r || path.startsWith(`${r}/`))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (!email || !adminEmails.includes(email)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

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
