import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

// Este manejador intercepta cualquier petición a /api/proxy/*
// Le inyecta el Token de Auth0 de forma segura desde el servidor
// Y la reenvía al backend de Java.
const handler = async (req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) => {
  try {
    // 1. Obtener el token de acceso de la sesión actual de Auth0
    // NextResponse() es requerido como segundo argumento en App Router
    const res = new NextResponse();
    const { accessToken } = await getAccessToken(req, res);

    if (!accessToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Reconstruir la URL para el backend de Java
    const resolvedParams = await ctx.params;
    const path = resolvedParams.path.join('/');
    const queryString = req.nextUrl.searchParams.toString();
    const backendUrl = `${process.env.BACKEND_URL || 'http://localhost:8080/api'}/${path}${queryString ? `?${queryString}` : ''}`;

    // 3. Preparar los headers
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
    };
    
    // Si la petición original traía Content-Type, lo mantenemos
    const contentType = req.headers.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    // 4. Leer el body solo si no es GET o HEAD
    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await req.text();
    }

    // 5. Hacer el fetch al backend de Java
    const backendResponse = await fetch(backendUrl, {
      method: req.method,
      headers,
      body,
    });

    // 6. Leer la respuesta del backend
    const data = await backendResponse.text();

    // 7. Devolverla al frontend de Next.js manteniendo el status original
    return new NextResponse(data, {
      status: backendResponse.status,
      headers: {
        'Content-Type': backendResponse.headers.get('content-type') || 'application/json'
      }
    });

  } catch (error: any) {
    console.error("Error en el proxy de API:", error);
    return NextResponse.json(
      { error: 'Error interno de comunicación con el backend' },
      { status: 500 }
    );
  }
};

// Envolvemos los métodos con withApiAuthRequired para que rechace automáticamente
// peticiones de usuarios que no hayan iniciado sesión.
export const GET = withApiAuthRequired(handler as any);
export const POST = withApiAuthRequired(handler as any);
export const PUT = withApiAuthRequired(handler as any);
export const DELETE = withApiAuthRequired(handler as any);
export const PATCH = withApiAuthRequired(handler as any);
