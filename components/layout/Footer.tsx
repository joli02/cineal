'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '32px', marginTop: '40px' }}>
      <div>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '12px' }}>
          <img src="/logo.svg" alt="Cineal" style={{ height: '28px', width: 'auto' }} />
        </Link>
        <p style={{ fontSize: '12px', color: '#6b6b80', lineHeight: 1.7, maxWidth: '220px' }}>
          Platforma shqiptare e streaming premium. Shiko filma dhe seriale me titra shqip, falas.
        </p>
      </div>

      {[
        { title: 'Linqe', links: [{ href:'/filma', label:'Filma' }, { href:'/seriale', label:'Seriale' }, { href:'/anime', label:'Anime' }, { href:'/trending', label:'Trending' }] },
        { title: 'Informacion', links: [{ href:'/rreth-nesh', label:'Rreth Nesh' }, { href:'/privatesia', label:'Privatësia' }, { href:'/kushtet', label:'Kushtet' }, { href:'/kontakt', label:'Kontakt' }] },
        { title: 'Kontakt', links: [{ href:'mailto:info@cineal.al', label:'info@cineal.al' }, { href:'https://instagram.com', label:'Instagram' }, { href:'https://facebook.com', label:'Facebook' }, { href:'https://tiktok.com', label:'TikTok' }] },
      ].map(col => (
        <div key={col.title}>
          <h4 style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', color: '#6b6b80', marginBottom: '14px' }}>{col.title}</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {col.links.map(link => (
              <li key={link.label}>
                <Link href={link.href} style={{ fontSize: '13px', color: '#6b6b80', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6b6b80')}
                >{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '11px', color: '#6b6b80' }}>© 2025 Cineal. Të gjitha të drejtat të rezervuara.</p>
        <p style={{ fontSize: '11px', color: '#6b6b80' }}>Titra Shqip · HD Quality</p>
      </div>
    </footer>
  )
}
