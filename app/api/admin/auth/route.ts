import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { password } = body
    const adminSecret = process.env.ADMIN_SECRET

    if (!adminSecret) {
      console.error('ADMIN_SECRET not set in .env.local')
      return NextResponse.json({ error: 'Server config error' }, { status: 500 })
    }

    if (!password || password !== adminSecret) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Sukses — vendos cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set('cineal_admin', adminSecret, {
      httpOnly: true,
      secure: false, // false për localhost
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Auth error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
