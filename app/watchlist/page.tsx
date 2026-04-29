'use client'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function WatchlistPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <h1 style={{ fontSize: '24px', fontWeight: 500, marginBottom: '8px' }}>Watchlist ime</h1>
        <p style={{ color: '#6b6b80', fontSize: '14px', marginBottom: '24px' }}>Filmat që dëshiron të shikosh më vonë</p>
        <p style={{ color: '#6b6b80', fontSize: '13px' }}>Nuk ke shtuar asnjë film akoma.</p>
        <Link href="/" style={{ color: '#e50914', textDecoration: 'none', fontSize: '14px', marginTop: '16px', display: 'inline-block' }}>← Shfleto filmat</Link>
      </div>
      <Footer />
    </div>
  )
}