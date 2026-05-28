import { initAuth0 } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const baseURL =
  process.env.AUTH0_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const auth0 = initAuth0({ baseURL });

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
