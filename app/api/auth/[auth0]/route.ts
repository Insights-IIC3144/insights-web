import auth0 from '@/lib/auth0';
import type { Session } from '@auth0/nextjs-auth0';

const { handleAuth, handleLogin, handleCallback, handleLogout } = auth0;
import { NextRequest, NextResponse } from 'next/server';

const handler = handleAuth({
  login: handleLogin((req) => {
    const connection = (req as NextRequest).nextUrl.searchParams.get('connection');
    return {
      redirectUri: `${(req as NextRequest).nextUrl.origin}/api/auth/callback`,
      authorizationParams: {
        prompt: 'login',
        scope: 'openid profile email',
        ...(connection && { connection }),
      }
    };
  }),
  logout: handleLogout({
    returnTo: '/login'
  }),
  callback: handleCallback({
    afterCallback: async (req: NextRequest, session: Session) => {
      // Sincronización con el Backend en el instante en que el usuario se loguea exitosamente
      try {
        const meUrl = `${process.env.BACKEND_URL || 'http://localhost:8080/api'}/users/me`;

        console.log("Verificando acceso en el backend: " + meUrl);

        const response = await fetch(meUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          }
        });

        if (!response.ok) {
          if (response.status === 403 || response.status === 401) {
            console.error("Usuario no autorizado en el sistema.");
            throw new Error("Acceso denegado. No estás autorizado en el sistema.");
          }
          throw new Error(`Error en el backend: ${response.statusText}`);
        }

        console.log("Acceso verificado correctamente.");

        // Si todo sale bien, retornamos la sesión normal y Next.js dejará pasar al usuario.
        return session;
      } catch (error: any) {
        console.error("Error en afterCallback sync:", error);
        error.status = 403;
        error.message = "unauthorized";
        throw error;
      }
    }
  })
});

export const GET = async (req: NextRequest, ctx: { params: Promise<{ auth0: string }> }) => {
  const resolvedParams = await ctx.params;
  const authResponse = await handler(req, { params: resolvedParams });

  // Si Auth0 devuelve un error HTTP (por ejemplo, 400 o 500) porque el afterCallback falló
  // interceptamos la respuesta y redirigimos nosotros mismos
  if (authResponse.status >= 400) {
    console.log("Interceptada respuesta de error de Auth0. Redirigiendo a /login...");
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(url);
  }

  return authResponse;
};
