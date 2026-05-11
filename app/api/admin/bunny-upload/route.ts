import { NextRequest, NextResponse } from 'next/server'

const BUNNY_STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || 'cinealsubtitles'
const BUNNY_STORAGE_HOST = process.env.BUNNY_STORAGE_HOST || 'storage.bunnycdn.com'
const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL || 'https://cinealsubtitles.b-cdn.net'

export async function POST(req: NextRequest) {
  if (!BUNNY_STORAGE_API_KEY) {
    return NextResponse.json(
      { error: '✗ BUNNY_STORAGE_API_KEY nuk është konfiguruar' },
      { status: 500 }
    )
  }

  try {
    const filename = req.nextUrl.searchParams.get('filename')
    if (!filename) {
      return NextResponse.json({ error: 'Filename mungon' }, { status: 400 })
    }

    const body = await req.arrayBuffer()

    const uploadRes = await fetch(
      `https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${filename}`,
      {
        method: 'PUT',
        headers: {
          AccessKey: BUNNY_STORAGE_API_KEY,
          'Content-Type': 'text/vtt',
        },
        body,
      }
    )

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      return NextResponse.json(
        { error: `Bunny gabim: ${errText}` },
        { status: uploadRes.status }
      )
    }

    const url = `${BUNNY_CDN_URL}/${filename}`
    return NextResponse.json({ url })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gabim gjatë ngarkimit' },
      { status: 500 }
    )
  }
}
