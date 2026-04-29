'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const PLANS = [
  {
    id: 'month',
    name: 'VIP 1 Muaj',
    price: '500',
    currency: 'ALL',
    days: 30,
    popular: false,
    features: [
      'Pa reklama',
      'HD 1080p',
      'Titra shqip',
      'Watchlist e pakufizuar',
      'Historiku i shikimit',
    ],
  },
  {
    id: 'sixmonth',
    name: 'VIP 6 Muaj',
    price: '2,500',
    currency: 'ALL',
    days: 180,
    popular: true,
    save: 'Kurseni 500 ALL',
    features: [
      'Pa reklama',
      'HD 1080p',
      'Titra shqip',
      'Watchlist e pakufizuar',
      'Historiku i shikimit',
      'Akses i hershëm',
    ],
  },
  {
    id: 'year',
    name: 'VIP 1 Vit',
    price: '4,500',
    currency: 'ALL',
    days: 365,
    popular: false,
    save: 'Kurseni 1,500 ALL',
    features: [
      'Pa reklama',
      'HD 1080p',
      'Titra shqip',
      'Watchlist e pakufizuar',
      'Historiku i shikimit',
      'Akses i hershëm',
      'Badge VIP special',
    ],
  },
]

export default function VipPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => setProfile(data))
      }
    })
  }, [])

  const handleSelectPlan = (plan: any) => {
    if (!user) { window.location.href = '/auth/login'; return }
    setSelectedPlan(plan)
    setShowPayment(true)
  }

  const PAYPAL_EMAIL = 'info@cineal.stream'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '60px 20px 40px' }}>
        <div style={{ fontSize: '12px', color: '#e50914', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>⭐ Cineal VIP</div>
        <h1 style={{ fontSize: '42px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.1 }}>
          Shiko pa kufizime
        </h1>
        <p style={{ fontSize: '16px', color: '#b0b0c0', maxWidth: '500px', margin: '0 auto' }}>
          Aktivizo VIP dhe shikoj të gjitha filmat pa reklama, në cilësi HD me titra shqip.
        </p>

        {profile?.role === 'vip' && (
          <div style={{ display: 'inline-block', marginTop: '20px', background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)', color: '#f5a623', padding: '10px 24px', borderRadius: '8px', fontSize: '14px' }}>
            ⭐ Je tashmë VIP! {profile.vip_expires_at && `Skadon: ${new Date(profile.vip_expires_at).toLocaleDateString('sq-AL')}`}
          </div>
        )}
      </div>

      {/* Plans */}
      {!showPayment && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', maxWidth: '900px', margin: '0 auto', padding: '0 24px 60px' }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{ position: 'relative', background: '#12121a', border: `1px solid ${plan.popular ? 'rgba(229,9,20,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '12px', padding: '28px', display: 'flex', flexDirection: 'column' }}>

              {plan.popular && (
                <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', background: '#e50914', color: '#fff', fontSize: '10px', fontWeight: 600, padding: '3px 14px', borderRadius: '0 0 8px 8px', letterSpacing: '1px' }}>
                  MË I POPULLARIT
                </div>
              )}

              {plan.save && (
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', display: 'inline-block', marginBottom: '12px', alignSelf: 'flex-start' }}>
                  🎉 {plan.save}
                </div>
              )}

              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '2px', color: plan.popular ? '#f5a623' : '#fff', marginBottom: '8px' }}>
                {plan.name}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '36px', fontWeight: 700 }}>{plan.price}</span>
                <span style={{ fontSize: '14px', color: '#6b6b80', marginLeft: '4px' }}>{plan.currency}</span>
              </div>

              <div style={{ flex: 1, marginBottom: '24px' }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '13px', color: '#b0b0c0' }}>
                    <span style={{ color: '#22c55e', fontSize: '14px' }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>

              <button onClick={() => handleSelectPlan(plan)}
                disabled={profile?.role === 'vip'}
                style={{ background: plan.popular ? '#e50914' : 'rgba(255,255,255,0.08)', border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '13px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: profile?.role === 'vip' ? 'not-allowed' : 'pointer', opacity: profile?.role === 'vip' ? 0.5 : 1 }}>
                {profile?.role === 'vip' ? '✓ Tashmë VIP' : 'Aktivizo Tani'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && selectedPlan && (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '0 24px 60px' }}>
          <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>💳 Pagesa me PayPal</h2>
            <p style={{ fontSize: '13px', color: '#6b6b80', marginBottom: '24px' }}>
              Plani: <strong style={{ color: '#fff' }}>{selectedPlan.name}</strong> — {selectedPlan.price} {selectedPlan.currency}
            </p>

            <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', color: '#f5a623', fontWeight: 500, marginBottom: '8px' }}>📋 Hapat e pagesës:</div>
              <div style={{ fontSize: '13px', color: '#b0b0c0', lineHeight: 1.8 }}>
                <div>1. Kliko butonin "Paguaj me PayPal"</div>
                <div>2. Dërgo <strong style={{ color: '#fff' }}>{selectedPlan.price} ALL</strong> te <strong style={{ color: '#fff' }}>{PAYPAL_EMAIL}</strong></div>
                <div>3. Te mesazhi shkruaj emailin tënd</div>
                <div>4. VIP aktivizohet brenda 1-24 orësh</div>
              </div>
            </div>

            
              href={`https://www.paypal.com/paypalme/cineal`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', background: '#0070BA', color: '#fff', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', textAlign: 'center', marginBottom: '12px' }}>
              💙 Paguaj me PayPal — {selectedPlan.price} ALL
            </a>

            <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b6b80', marginBottom: '20px' }}>
              ose dërgo direkt te: <strong style={{ color: '#b0b0c0' }}>{PAYPAL_EMAIL}</strong>
            </div>

            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#22c55e', marginBottom: '20px' }}>
              ✓ Pasi të bësh pagesën, na kontakto te <strong>info@cineal.stream</strong> me emailin tënd dhe do ta aktivizojmë VIP-in menjëherë!
            </div>

            <button onClick={() => setShowPayment(false)}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#6b6b80', padding: '10px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', width: '100%' }}>
              ← Kthehu te planet
            </button>
          </div>
        </div>
      )}

      {/* Features */}
      <div style={{ background: '#12121a', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '60px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '40px' }}>Pse VIP?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { icon: '🚫', title: 'Pa Reklama', desc: 'Shiko filmat pa asnjë ndërprerje' },
              { icon: '🎬', title: 'HD 1080p', desc: 'Cilësi e lartë për çdo film' },
              { icon: '💬', title: 'Titra Shqip', desc: 'Të gjitha filmat me titra shqip' },
            ].map(f => (
              <div key={f.title} style={{ padding: '20px' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{f.icon}</div>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: '#6b6b80' }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
