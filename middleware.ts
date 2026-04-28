import { getSession } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const session = await getSession(req, res);
  
  // Si no hay sesión (usuario no logueado), redirigirlo a nuestra landing page personalizada
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return res;
}

export const config = {
  // Configurar las rutas donde aplica el middleware (proteger toda la aplicación excepto login, estáticos, y API)
  matcher: ['/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)'],
}
