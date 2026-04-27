import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function PrivatesiaPage() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 32px' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '40px', letterSpacing: '3px', marginBottom: '8px' }}>Privatësia</h1>
        <div style={{ width: '40px', height: '3px', background: '#e50914', marginBottom: '32px', borderRadius: '2px' }} />
        <p style={{ fontSize: '15px', color: '#b0b0c0', lineHeight: 1.9, marginBottom: '28px', fontWeight: 300 }}>
          Ne vlerësojmë privatësinë tuaj dhe angazhohemi për të mbrojtur të dhënat personale.
        </p>
        {[
          'Nuk shesim ose ndajmë të dhënat tuaja me palë të treta pa lejen tuaj',
          'Mbledhim vetëm informacionin minimal të nevojshëm për funksionimin e platformës',
          'Të dhënat përdoren për përmirësimin e eksperiencës dhe performancës',
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '6px', height: '6px', background: '#e50914', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }} />
            <p style={{ fontSize: '14px', color: '#b0b0c0', lineHeight: 1.8, fontWeight: 300 }}>{item}</p>
          </div>
        ))}
        <p style={{ fontSize: '14px', color: '#6b6b80', lineHeight: 1.8, marginTop: '28px', fontStyle: 'italic' }}>
          Duke përdorur Cineal, ju pranoni përpunimin e të dhënave sipas kësaj politike.
        </p>
      </div>
      <Footer />
    </div>
  )
}
