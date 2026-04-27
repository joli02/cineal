'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Ruaj token te localStorage gjithashtu
        localStorage.setItem('cineal_admin_auth', 'true')
        window.location.href = '/admin'
      } else {
        setError('Fjalëkalimi është i gabuar.')
      }
    } catch (err) {
      setError('Problem me serverin. Provo sërish.')
    }

    setLoading(false)
  }

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <img src="/logo.svg" alt="Cineal" style={{ height: '40px', marginBottom: '32px' }} />
      <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '36px', width: '100%', maxWidth: '380px' }}>
        <div style={{ fontSize: '9px', background: 'rgba(229,9,20,0.12)', border: '1px solid rgba(229,9,20,0.25)', color: '#ff6b6b', padding: '3px 10px', borderRadius: '10px', letterSpacing: '1.5px', display: 'inline-block', marginBottom: '16px' }}>ADMIN PANEL</div>
        <h1 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '6px' }}>Hyr si Administrator</h1>
        <p style={{ fontSize: '13px', color: '#6b6b80', marginBottom: '24px' }}>Zona e mbrojtur — vetëm për admin.</p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>Fjalëkalimi i Admin</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoFocus
              style={{ width: '100%', background: '#0a0a0f', border: `1px solid ${error ? 'rgba(229,9,20,0.5)' : 'rgba(255,255,255,0.08)'}`, color: '#fff', padding: '11px 14px', borderRadius: '6px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {error && <p style={{ fontSize: '12px', color: '#ff6b6b', margin: 0 }}>⚠ {error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ background: loading ? '#6b1a1e' : '#e50914', border: 'none', color: '#fff', padding: '13px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%', marginTop: '4px' }}
          >
            {loading ? 'Duke verifikuar...' : 'Hyr në Admin'}
          </button>
        </form>
      </div>
      <p style={{ fontSize: '11px', color: '#6b6b80', marginTop: '20px' }}>
        ← <a href="/" style={{ color: '#6b6b80', textDecoration: 'none' }}>Kthehu te faqja kryesore</a>
      </p>
    </div>
  )
}
