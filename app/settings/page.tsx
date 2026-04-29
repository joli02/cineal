'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'success'|'error'>('success')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth/login'); return }
      setUser(session.user)
      setEmail(session.user.email || '')
      setName(session.user.user_metadata?.full_name || '')
    })
  }, [])

  const showMsg = (text: string, type: 'success'|'error' = 'success') => {
    setMsg(text); setMsgType(type)
    setTimeout(() => setMsg(''), 3000)
  }

  const handleSaveName = async () => {
    if (!name.trim()) { showMsg('Emri nuk mund të jetë bosh!', 'error'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } })
    if (error) showMsg('Gabim: ' + error.message, 'error')
    else showMsg('Emri u ndryshua me sukses! ✓')
    setLoading(false)
  }

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { showMsg('Fjalëkalimi duhet të ketë minimum 8 karaktere!', 'error'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) showMsg('Gabim: ' + error.message, 'error')
    else { showMsg('Fjalëkalimi u ndryshua me sukses! ✓'); setNewPassword('') }
    setLoading(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', background: '#0a0a0f',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', padding: '11px 14px', borderRadius: '6px',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 24px)' }}>
        <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 600, marginBottom: '32px' }}>⚙️ Cilësimet</h1>

        {msg && (
          <div style={{ background: msgType === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(229,9,20,0.1)', border: `1px solid ${msgType === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(229,9,20,0.3)'}`, color: msgType === 'success' ? '#22c55e' : '#ff6b6b', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
            {msg}
          </div>
        )}

        {/* Profili */}
        <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: 'clamp(16px, 4vw, 24px)', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '20px', color: '#b0b0c0' }}>👤 Informacioni i Profilit</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>Emri</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Emri yt" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>Email</label>
              <input value={email} disabled style={{ ...inp, color: '#6b6b80', cursor: 'not-allowed' }} />
              <span style={{ fontSize: '11px', color: '#6b6b80', marginTop: '4px', display: 'block' }}>Email-i nuk mund të ndryshohet</span>
            </div>
            <button onClick={handleSaveName} disabled={loading}
              style={{ background: loading ? '#444' : '#e50914', border: 'none', color: '#fff', padding: '11px 24px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', alignSelf: 'flex-start', width: '100%' }}>
              {loading ? 'Duke ruajtur...' : 'Ruaj ndryshimet'}
            </button>
          </div>
        </div>

        {/* Fjalëkalimi */}
        <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: 'clamp(16px, 4vw, 24px)', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '20px', color: '#b0b0c0' }}>🔒 Ndrysho Fjalëkalimin</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>Fjalëkalimi i Ri</label>
              <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" placeholder="Minimum 8 karaktere" style={inp} />
            </div>
            <button onClick={handleChangePassword} disabled={loading}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '11px 24px', borderRadius: '6px', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}>
              {loading ? 'Duke ndryshuar...' : 'Ndrysho fjalëkalimin'}
            </button>
          </div>
        </div>

        {/* Zona e rrezikshme */}
        <div style={{ background: '#12121a', border: '1px solid rgba(255,107,107,0.15)', borderRadius: '10px', padding: 'clamp(16px, 4vw, 24px)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px', color: '#ff6b6b' }}>⚠️ Dil nga llogaria</h2>
          <p style={{ fontSize: '13px', color: '#6b6b80', marginBottom: '16px' }}>Nëse del nga llogaria, do të duhet të hysh sërish.</p>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
            style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', width: '100%' }}>
            🚪 Dil nga llogaria
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}