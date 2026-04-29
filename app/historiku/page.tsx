'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function HistorikuPage() {
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }
      const { data } = await supabase
        .from('watch_history')
        .select('movie_id, watched_at, movies(*)')
        .eq('user_id', session.user.id)
        .order('watched_at', { ascending: false })
      if (data) setMovies(data.map((w: any) => w.movies).filter(Boolean))
      setLoading(false)
    }
    fetchHistory()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ padding: '40px 60px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>🕐 Historiku im</h1>
        {loading && <p style={{ color: '#6b6b80' }}>Duke ngarkuar...</p>}
        {!loading && movies.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🕐</div>
            <p style={{ color: '#6b6b80', marginBottom: '16px' }}>Nuk ke parë asnjë film akoma.</p>
            <Link href="/" style={{ color: '#e50914', textDecoration: 'none' }}>← Shfleto filmat</Link>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
          {movies.map((m: any) => (
            <Link key={m.id} href={`/film/${m.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ borderRadius: '8px', overflow: 'hidden', background: '#12121a', cursor: 'pointer' }}>
                <img src={m.poster_url} alt={m.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
                <div style={{ padding: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#fff' }}>{m.title}</div>
                  <div style={{ fontSize: '11px', color: '#6b6b80' }}>{m.year}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}