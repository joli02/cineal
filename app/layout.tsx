import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cineal — Filma me Titra Shqip',
  description: 'Platforma shqiptare e streaming premium. Shiko filma dhe seriale me titra shqip, falas.',
  keywords: 'filma shqip, titra shqip, streaming shqip, seriale shqip',
  openGraph: {
    title: 'Cineal — Filma me Titra Shqip',
    description: 'Platforma shqiptare e streaming premium.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sq">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
