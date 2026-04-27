import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function KushtetPage() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 32px' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '40px', letterSpacing: '3px', marginBottom: '8px' }}>Kushtet</h1>
        <div style={{ width: '40px', height: '3px', background: '#e50914', marginBottom: '32px', borderRadius: '2px' }} />
        <p style={{ fontSize: '15px', color: '#b0b0c0', lineHeight: 1.9, marginBottom: '28px', fontWeight: 300 }}>
          Duke përdorur Cineal, ju pranoni këto kushte:
        </p>
        {[
          'Platforma ofron përmbajtje për qëllime argëtimi',
          'Përdoruesit nuk lejohen të kopjojnë, shpërndajnë ose riprodhojnë përmbajtjen pa leje',
          'Cineal rezervon të drejtën të ndryshojë ose përditësojë shërbimin në çdo kohë',
          'Çdo abuzim me platformën mund të çojë në kufizim ose bllokim të aksesit',
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '6px', height: '6px', background: '#e50914', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }} />
            <p style={{ fontSize: '14px', color: '#b0b0c0', lineHeight: 1.8, fontWeight: 300 }}>{item}</p>
          </div>
        ))}
        <p style={{ fontSize: '14px', color: '#6b6b80', lineHeight: 1.8, marginTop: '28px', fontStyle: 'italic' }}>
          Përdorimi i vazhdueshëm i platformës nënkupton pranimin e këtyre kushteve.
        </p>
      </div>
      <Footer />
    </div>
  )
}
