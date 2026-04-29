'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Plotëso të gjitha fushat!')
      return
    }
    if (password.length < 8) {
      setError('Fjalëkalimi duhet të ketë minimum 8 karaktere!')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      })
      if (error) throw error
      setSuccess(true)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  const inp = {
    width: '100%', background: '#0a0a0f',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', padding: '11px 14px', borderRadius: '6px',
    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    outline: 'none', boxSizing: 'border-box' as const
  }

  if (success) return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: '#12121a', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px', padding: '40px', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
        <h2 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '8px' }}>Kontrollo emailin!</h2>
        <p style={{ fontSize: '14px', color: '#6b6b80', marginBottom: '20px' }}>
          Kemi dërguar një link konfirmimi te <strong style={{ color: '#fff' }}>{email}</strong>. Kliko linkun për të aktivizuar llogarinë.
        </p>
        <Link href="/auth/login" style={{ color: '#e50914', textDecoration: 'none', fontSize: '14px' }}>Shko te hyrja →</Link>
      </div>
    </div>
  )

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

        {error && (
          <div style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)', color: '#ff6b6b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>Emri</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Emri yt" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="emri@email.com" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>Fjalëkalimi</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Minimum 8 karaktere" style={inp} />
          </div>
          <button
            onClick={handleRegister}
            disabled={loading}
            style={{ background: loading ? '#666' : '#e50914', border: 'none', color: '#fff', padding: '13px', borderRadius: '6px', fontSize: '15px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%', marginTop: '6px' }}>
            {loading ? 'Duke u regjistruar...' : 'Regjistrohu Falas'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b6b80' }}>
          Ke llogari?{' '}
          <Link href="/auth/login" style={{ color: '#e50914', textDecoration: 'none', fontWeight: 500 }}>Hyr</Link>
        </div>
      </div>
    </div>
  )
}