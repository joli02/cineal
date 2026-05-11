'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [gender, setGender] = useState<'male' | 'female' | ''>('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) { setError('Plotëso të gjitha fushat!'); return }
    if (!gender) { setError('Zgjedh gjininë!'); return }
    if (password !== confirmPassword) { setError('Fjalëkalimet nuk përputhen!'); return }
    if (password.length < 8) { setError('Fjalëkalimi duhet të ketë minimum 8 karaktere!'); return }
    if (!acceptTerms) { setError('Duhet të pranosh kushtet e përdorimit!'); return }
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name, gender } }
      })
      if (error) throw error
      setSuccess(true)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', background: '#1a1818',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', padding: '11px 14px', borderRadius: '6px',
    fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    outline: 'none', boxSizing: 'border-box',
  }

  const EyeIcon = ({ show }: { show: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {show
        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  )

  if (success) return (
    <div style={{ background: '#262424', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: '#1a1818', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px', padding: '40px', maxWidth: '420px', textAlign: 'center' }}>
        <img src={gender === 'female' ? '/female_icon.svg' : '/male_icon.svg'} alt={gender || ''} style={{ width: '80px', height: '80px', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 500, color: '#fff', marginBottom: '8px' }}>Llogaria u krijua!</h2>
        <p style={{ fontSize: '14px', color: '#6b6b80', marginBottom: '20px' }}>
          Kemi dërguar një link konfirmimi te <strong style={{ color: '#fff' }}>{email}</strong>.
        </p>
        <Link href="/auth/login" style={{ color: '#e50914', textDecoration: 'none', fontSize: '14px' }}>Shko te hyrja →</Link>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#262424', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: '20px' }}>
      <Link href="/" style={{ textDecoration: 'none', marginBottom: '28px' }}>
        <img src="/logo.svg" alt="Cineal" style={{ height: '30px' }} />
      </Link>

      <div style={{ background: '#1a1818', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '36px', width: '100%', maxWidth: '440px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>Krijo llogarinë</h1>
        <p style={{ fontSize: '13px', color: '#6b6b80', marginBottom: '24px' }}>Fillo të shijosh Cineal falas!</p>

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
            <div style={{ position: 'relative' }}>
              <input value={password} onChange={e => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'} placeholder="Minimum 8 karaktere"
                style={{ ...inp, paddingRight: '44px' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b6b80', cursor: 'pointer', display: 'flex', padding: 0 }}>
                <EyeIcon show={showPassword} />
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '6px' }}>Konfirmo Fjalëkalimin</label>
            <div style={{ position: 'relative' }}>
              <input value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                type={showConfirm ? 'text' : 'password'} placeholder="Ripërsërit fjalëkalimin"
                style={{ ...inp, paddingRight: '44px', borderColor: confirmPassword && password !== confirmPassword ? 'rgba(229,9,20,0.5)' : 'rgba(255,255,255,0.08)' }} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b6b80', cursor: 'pointer', display: 'flex', padding: 0 }}>
                <EyeIcon show={showConfirm} />
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <div style={{ fontSize: '11px', color: '#ff6b6b', marginTop: '4px' }}>Fjalëkalimet nuk përputhen</div>
            )}
          </div>

          {/* Gjinia — side by side me SVG */}
          <div>
            <label style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '10px' }}>Gjinia</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { value: 'male', label: 'Mashkull', icon: '/male_icon.svg' },
                { value: 'female', label: 'Femër', icon: '/female_icon.svg' },
              ].map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setGender(opt.value as 'male' | 'female')}
                  style={{
                    padding: '16px 10px', borderRadius: '10px', cursor: 'pointer',
                    background: gender === opt.value ? 'rgba(229,9,20,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${gender === opt.value ? '#e50914' : 'rgba(255,255,255,0.08)'}`,
                    color: gender === opt.value ? '#fff' : '#b0b0c0',
                    fontFamily: "'DM Sans', sans-serif",
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    transition: 'all 0.15s',
                  }}>
                  <img src={opt.icon} alt={opt.label} style={{ width: '52px', height: '52px', borderRadius: '50%' }} />
                  <span style={{ fontSize: '13px', fontWeight: gender === opt.value ? 600 : 400 }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '12px', color: '#b0b0c0', lineHeight: 1.6 }}>
            <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)}
              style={{ accentColor: '#e50914', width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }} />
            <span>
              Pranoj{' '}
              <Link href="/kushtet" style={{ color: '#e50914', textDecoration: 'none' }}>Kushtet e Përdorimit</Link>
              {' '}dhe{' '}
              <Link href="/privatesia" style={{ color: '#e50914', textDecoration: 'none' }}>Politikën e Privatësisë</Link>
            </span>
          </label>

          <button onClick={handleRegister} disabled={loading}
            style={{ background: loading ? '#444' : '#e50914', border: 'none', color: '#fff', padding: '13px', borderRadius: '6px', fontSize: '15px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%', marginTop: '4px' }}>
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
