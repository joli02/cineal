'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <Link href="/" style={{ textDecoration: 'none', marginBottom: '32px' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '4px', color: '#fff' }}>
          <span style={{ color: '#e50914' }}>C</span>INEAL
        </div>
      </Link>
      <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '36px', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 500, marginBottom: '6px' }}>Krijo llogarinë</h1>
        <p style={{ fontSize: '13px', color: '#6b6b80', marginBottom: '28px' }}>Fillo të shijosh Cineal falas!</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>Emri</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Emri yt"
              style={{ width: '100%', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '11px 14px', borderRadius: '6px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="emri@email.com"
              style={{ width: '100%', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '11px 14px', borderRadius: '6px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>Fjalëkalimi</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Minimum 8 karaktere"
              style={{ width: '100%', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '11px 14px', borderRadius: '6px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none' }} />
          </div>
          <button style={{ background: '#e50914', border: 'none', color: '#fff', padding: '13px', borderRadius: '6px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%', marginTop: '6px' }}>
            Regjistrohu Falas
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b6b80' }}>
          Ke llogari?{' '}
          <Link href="/auth/login" style={{ color: '#e50914', textDecoration: 'none', fontWeight: 500 }}>Hyr</Link>
        </div>
        <p style={{ fontSize: '11px', color: '#6b6b80', textAlign: 'center', marginTop: '16px', lineHeight: 1.6 }}>
          Duke u regjistruar, pranon <Link href="/kushtet" style={{ color: '#6b6b80' }}>Kushtet</Link> dhe <Link href="/privatesia" style={{ color: '#6b6b80' }}>Privatësinë</Link> e Cineal.
        </p>
      </div>
    </div>
  )
}
