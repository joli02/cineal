'use client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function SettingsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚙️</div>
        <h1 style={{ fontSize: '24px', fontWeight: 500, marginBottom: '8px' }}>Cilësimet</h1>
        <p style={{ color: '#6b6b80', fontSize: '14px' }}>Cilësimet e llogarisë — duke u ndërtuar</p>
      </div>
      <Footer />
    </div>
  )
}