import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function KontaktPage() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 32px' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '40px', letterSpacing: '3px', marginBottom: '8px' }}>Kontakt</h1>
        <div style={{ width: '40px', height: '3px', background: '#e50914', marginBottom: '32px', borderRadius: '2px' }} />
        <p style={{ fontSize: '14px', color: '#b0b0c0', lineHeight: 1.8, marginBottom: '32px', fontWeight: 300 }}>
          Për çdo pyetje, sugjerim ose problem teknik, mos hezito të na kontaktosh.
        </p>
        <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '28px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>✉</div>
          <div>
            <div style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Email</div>
            <a href="mailto:info@cineal.al" style={{ fontSize: '16px', color: '#fff', textDecoration: 'none', fontWeight: 500 }}>info@cineal.al</a>
            <p style={{ fontSize: '12px', color: '#6b6b80', marginTop: '4px' }}>Përgjigjemi brenda 24 orëve</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
