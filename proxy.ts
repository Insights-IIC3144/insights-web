import auth0 from '@/lib/auth0';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function proxy(req: NextRequest) {
  // Bypass de autenticación exclusivo para tests E2E con Cypress.
  // Solo activo cuando NODE_ENV !== 'production', nunca se despliega en Vercel.
  if (process.env.CYPRESS_TESTING === 'true' && process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const session = await auth0.getSession(req, res);

  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)'],
}
