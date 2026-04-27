import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function RrethNeshPage() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 32px' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '40px', letterSpacing: '3px', marginBottom: '8px' }}>Rreth Nesh</h1>
        <div style={{ width: '40px', height: '3px', background: '#e50914', marginBottom: '32px', borderRadius: '2px' }} />
        <p style={{ fontSize: '15px', color: '#b0b0c0', lineHeight: 1.9, marginBottom: '20px', fontWeight: 300 }}>
          Cineal është një platformë moderne për shikimin e filmave dhe serialeve online, e fokusuar në eksperiencë të thjeshtë, të shpejtë dhe të aksesueshme për përdoruesit shqiptarë. Ne kombinojmë teknologjinë me përmbajtje të kuruar për të sjellë një ambient ku argëtimi është gjithmonë një klikim larg.
        </p>
        <p style={{ fontSize: '15px', color: '#b0b0c0', lineHeight: 1.9, marginBottom: '20px', fontWeight: 300 }}>
          Qëllimi ynë është të krijojmë një hapësirë digjitale ku përdoruesit mund të shijojnë përmbajtje cilësore, me subtitle të optimizuara dhe një ndërfaqe intuitive.
        </p>
        <p style={{ fontSize: '15px', color: '#b0b0c0', lineHeight: 1.9, fontWeight: 300 }}>
          Cineal nuk është thjesht një platformë — është një eksperiencë e re shikimi.
        </p>
      </div>
      <Footer />
    </div>
  )
}
