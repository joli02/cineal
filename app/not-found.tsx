'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', padding: '32px' }}>
      <img src="/logo.svg" alt="Cineal" style={{ height: '36px', marginBottom: '40px', opacity: 0.7 }} />
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '120px', letterSpacing: '4px', color: 'rgba(229,9,20,0.15)', lineHeight: 1, marginBottom: '-20px' }}>404</div>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '3px', marginBottom: '12px' }}>Faqja nuk u gjet</h1>
      <p style={{ fontSize: '14px', color: '#6b6b80', marginBottom: '32px', maxWidth: '320px', lineHeight: 1.7 }}>Faqja që kërkove nuk ekziston ose është zhvendosur.</p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link href="/">
          <button style={{ background: '#e50914', border: 'none', color: '#fff', padding: '11px 28px', borderRadius: '5px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Kthehu në Home</button>
        </Link>
        <Link href="/filma">
          <button style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '11px 28px', borderRadius: '5px', fontSize: '14px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Shiko Filmat</button>
        </Link>
      </div>
    </div>
  )
}
