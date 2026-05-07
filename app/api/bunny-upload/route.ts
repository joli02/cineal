import { NextRequest, NextResponse } from 'next/server'

const BUNNY_STORAGE_ZONE = 'cineal-subtitles'
const BUNNY_CDN_URL = 'https://cinealsubtitles.b-cdn.net'

export async function POST(req: NextRequest) {
  try {
    const filename = req.nextUrl.searchParams.get('filename')
    if (!filename) {
      return NextResponse.json({ error: 'Filename mungon' }, { status: 400 })
    }

    const apiKey = process.env.BUNNY_STORAGE_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'BUNNY_STORAGE_KEY nuk është konfiguruar' }, { status: 500 })
    }

    const body = await req.arrayBuffer()

    const uploadRes = await fetch(
      `https://storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${filename}`,
      {
        method: 'PUT',
        headers: {
          'AccessKey': apiKey,
          'Content-Type': 'text/vtt',
        },
        body: body,
      }
    )

    if (!uploadRes.ok) {
      const err = await uploadRes.text()
      return NextResponse.json({ error: `Bunny error: ${err}` }, { status: uploadRes.status })
    }

    const url = `${BUNNY_CDN_URL}/${filename}`
    return NextResponse.json({ url, filename })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
