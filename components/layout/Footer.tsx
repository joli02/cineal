'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '40px' }}>
      <div style={{ padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 32px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'clamp(24px, 4vw, 32px)' }}>
        <div>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '12px' }}>
            <img src="/logo.svg" alt="Cineal" style={{ height: '28px', width: 'auto' }} />
          </Link>
          <p style={{ fontSize: '12px', color: '#6b6b80', lineHeight: 1.7, maxWidth: '220px' }}>
            Platforma shqiptare e streaming premium. Shiko filma dhe seriale me titra shqip, falas.
          </p>
        </div>
        {[
          {
            title: 'Linqe',
            links: [
              { href: '/filma', label: 'Filma' },
              { href: '/seriale', label: 'Seriale' },
              { href: '/anime', label: 'Anime' },
              { href: '/kids', label: 'Kids' },
              { href: '/vip', label: 'VIP' },
            ]
          },
          {
            title: 'Informacion',
            links: [
              { href: '/rreth-nesh', label: 'Rreth Nesh' },
              { href: '/privatesia', label: 'Privatësia' },
              { href: '/kushtet', label: 'Kushtet' },
              { href: '/kontakt', label: 'Kontakt' },
            ]
          },
          {
            title: 'Kontakt',
            links: [
              { href: 'mailto:info@cineal.stream', label: 'info@cineal.stream' },
              { href: 'https://instagram.com/cineal.stream', label: 'Instagram' },
              { href: 'https://tiktok.com/@cineal.stream', label: 'TikTok' },
            ]
          },
        ].map(col => (
          <div key={col.title}>
            <h4 style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', color: '#6b6b80', marginBottom: '14px' }}>{col.title}</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {col.links.map(link => (
                <li key={link.label}>
                  <Link href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    style={{ fontSize: '13px', color: '#6b6b80', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6b6b80')}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: 'clamp(12px, 2vw, 16px) clamp(16px, 4vw, 32px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <p style={{ fontSize: '11px', color: '#6b6b80' }}>© 2025 Cineal. Të gjitha të drejtat të rezervuara.</p>
        <p style={{ fontSize: '11px', color: '#6b6b80' }}>Titra Shqip · HD Quality</p>
      </div>
    </footer>
  )
}
