import { handleAuth, handleLogin, handleCallback, Session, handleLogout } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

const handler = handleAuth({
  login: handleLogin((req) => {
    const connection = (req as NextRequest).nextUrl.searchParams.get('connection');
    return {
      authorizationParams: {
        prompt: 'login',
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
        const syncUrl = `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/users/sync`;
        
        console.log("Iniciando sincronización con el backend: " + syncUrl);
        
        // Asumiendo que has configurado AUTH0_AUDIENCE, session.accessToken contendrá un JWT válido
        // Si no está configurado AUTH0_AUDIENCE, esto será un opaque token y el backend Java lo rechazará.
        const response = await fetch(syncUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`
          },
          // NOTA: Ya no enviamos retailer_id desde el frontend.
          // El backend se encarga de extraer el email del token y buscar el retailer_id.
          body: JSON.stringify({
            email: session.user.email,
            auth0_id: session.user.sub,
            name: session.user.name,
            picture: session.user.picture
          })
        });

        if (!response.ok) {
          if (response.status === 403 || response.status === 404) {
            console.error("Usuario no invitado o retailer no encontrado. Bloqueando acceso.");
            throw new Error("Acceso denegado. No estás autorizado en el sistema.");
          }
          throw new Error(`Error en el backend al sincronizar: ${response.statusText}`);
        }

        console.log("Sincronización exitosa con el backend.");
        
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
  // @ts-ignore - Bypass Next.js SDK typing issues with unwrapped params
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
