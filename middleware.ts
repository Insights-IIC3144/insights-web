import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('simulated_auth');
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  // Si no está loggeado y trata de entrar a cualquier página que no sea el login
  if (!authCookie && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si ya está loggeado y trata de ir al login, lo devolvemos al dashboard
  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Configurar las rutas donde aplica el middleware (excluir estáticos y API)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
