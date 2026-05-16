/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'image.tmdb.org',
      'vz-cdn.b-cdn.net',
      'iframe.mediadelivery.net',
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Parandalon embed-imin e faqes në iframe nga faqe të tjera
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },

          // Parandalon MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          // Nuk dërgon URL-në te faqe të tjera
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          // Forcon HTTPS gjithmonë
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },

          // Çaktivizon features që nuk nevojiten
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },

          // CSP — kontrollon çfarë mund të ngarkohet në faqe
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data: blob: image.tmdb.org *.tmdb.org",
              "media-src 'self' blob: *.b-cdn.net",
              // Vetëm Bunny.net lejohet për video embed
              "frame-src 'self' iframe.mediadelivery.net",
              "connect-src 'self' *.supabase.co wss://*.supabase.co api.themoviedb.org api.openai.com *.b-cdn.net",
            ].join('; '),
          },
        ],
      },

      // Admin route — mbrojtje maksimale, nuk cache-ohet kurrë
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
