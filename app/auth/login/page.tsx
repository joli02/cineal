'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Plotëso të gjitha fushat!')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/')
    } catch (e: any) {
      setError('Email ose fjalëkalim i gabuar!')
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

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <Link href="/" style={{ textDecoration: 'none', marginBottom: '32px' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '4px', color: '#fff' }}>
          <span style={{ color: '#e50914' }}>C</span>INEAL
        </div>
      </Link>
      <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '36px', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 500, marginBottom: '6px' }}>Hyr në llogarinë tënde</h1>
        <p style={{ fontSize: '13px', color: '#6b6b80', marginBottom: '28px' }}>Mirë se erdhe përsëri!</p>

        {error && (
          <div style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)', color: '#ff6b6b', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="emri@email.com" style={inp} />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>Fjalëkalimi</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" style={inp} />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ background: loading ? '#666' : '#e50914', border: 'none', color: '#fff', padding: '13px', borderRadius: '6px', fontSize: '15px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%', marginTop: '6px' }}>
            {loading ? 'Duke hyrë...' : 'Hyr'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b6b80' }}>
          Nuk ke llogari?{' '}
          <Link href="/auth/register" style={{ color: '#e50914', textDecoration: 'none', fontWeight: 500 }}>Regjistrohu</Link>
        </div>
      </div>
    </div>
  )
}