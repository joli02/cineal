import { NextRequest, NextResponse } from 'next/server'

// Bunny Storage config
const BUNNY_STORAGE_ZONE = 'cineal-subtitles'
const BUNNY_STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY || ''
const BUNNY_CDN_URL = 'https://cineal-sub.b-cdn.net'

export async function POST(request: NextRequest) {
  try {
    const filename = request.nextUrl.searchParams.get('filename')
    if (!filename) {
      return NextResponse.json({ error: 'Filename mungon' }, { status: 400 })
    }

    if (!BUNNY_STORAGE_API_KEY) {
      return NextResponse.json({ error: 'BUNNY_STORAGE_API_KEY nuk është konfiguruar' }, { status: 500 })
    }

    const body = await request.arrayBuffer()

    const bunnyRes = await fetch(
      `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${filename}`,
      {
        method: 'PUT',
        headers: {
          'AccessKey': BUNNY_STORAGE_API_KEY,
          'Content-Type': 'text/vtt',
        },
        body: body,
      }
    )

    if (!bunnyRes.ok) {
      const errText = await bunnyRes.text()
      return NextResponse.json({ error: `Bunny error: ${errText}` }, { status: 500 })
    }

    const cdnUrl = `${BUNNY_CDN_URL}/${filename}`
    return NextResponse.json({ url: cdnUrl, success: true })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gabim i panjohur' }, { status: 500 })
  }
}
