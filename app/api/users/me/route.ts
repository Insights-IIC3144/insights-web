import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0'
import { NextRequest, NextResponse } from 'next/server'

const handler = async (req: NextRequest) => {
  try {
    const res = new NextResponse()
    const { accessToken } = await getAccessToken(req, res)

    if (!accessToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const backendRes = await fetch(
      `${process.env.BACKEND_URL || 'http://localhost:8080/api'}/users/me`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      }
    )

    const data = await backendRes.text()

    return new NextResponse(data, {
      status: backendRes.status,
      headers: {
        'Content-Type': backendRes.headers.get('content-type') || 'application/json',
      },
    })
  } catch (error) {
    console.error('[/api/users/me]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export const GET = withApiAuthRequired(handler as any)