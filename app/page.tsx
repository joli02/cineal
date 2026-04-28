'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MovieCard, { TrendingCard } from '@/components/movie/MovieCard'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [movies, setMovies] = useState<any[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMovies() {
      try {
        const { data } = await supabase
          .from('movies')
          .select('*')
          .eq('status', 'live')
          .order('created_at', { ascending: false })
          .limit(24)
        if (data) {
          setMovies(data)
          setTrending(data.filter((m: any) => m.is_trending).slice(0, 5) || data.slice(0, 5))
        }
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    fetchMovies()
  }, [])

  const featured = movies[0]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* HERO */}
      {featured && (
        <div style={{ position: 'relative', height: '70vh', minHeight: '500px', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${featured.backdrop_url || featured.poster_url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(0.4)'
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(10,10,15,0.95) 40%, transparent 100%)'
          }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '120px 60px 60px', maxWidth: '600px' }}>
            <div style={{ fontSize: '11px', color: '#e50914', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
              🔥 Film i Ri
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: 700, lineHeight: 1.1, marginBottom: '12px' }}>
              {featured.title_sq || featured.title}
            </h1>
            <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#b0b0c0', marginBottom: '16px' }}>
              <span>{featured.year}</span>
              <span>•</span>
              <span>{featured.genre}</span>
              <span>•</span>
              <span>⭐ {featured.rating}</span>
              {featured.duration && <><span>•</span><span>{featured.duration}</span></>}
            </div>
            {featured.description && (
              <p style={{ fontSize: '14px', color: '#b0b0c0', lineHeight: 1.6, marginBottom: '24px', maxWidth: '500px' }}>
                {featured.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link href={`/film/${featured.slug}`} style={{
                background: '#e50914', color: '#fff', padding: '12px 28px',
                borderRadius: '5px', textDecoration: 'none', fontWeight: 600, fontSize: '14px'
              }}>
                ▶ Shiko Tani
              </Link>
              <Link href={`/film/${featured.slug}`} style={{
                background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '12px 28px',
                borderRadius: '5px', textDecoration: 'none', fontWeight: 500, fontSize: '14px',
                border: '1px solid rgba(255,255,255,0.15)'
              }}>
                + Më Shumë
              </Link>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '40px 60px' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b6b80' }}>
            Duke ngarkuar filmat...
          </div>
        )}

        {!loading && movies.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
            <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>Nuk ka filma akoma</div>
            <div style={{ fontSize: '14px', color: '#6b6b80' }}>Shto filmat e parë nga Admin Panel</div>
          </div>
        )}

        {/* TRENDING */}
        {trending.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>🔥 TRENDING</h2>
              <Link href="/trending" style={{ fontSize: '13px', color: '#e50914', textDecoration: 'none' }}>Shiko të gjitha →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              {trending.map((m: any) => (
                <TrendingCard key={m.id} movie={m} />
              ))}
            </div>
          </div>
        )}

        {/* TË GJITHA FILMAT */}
        {movies.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>🎬 Filmat</h2>
              <Link href="/filma" style={{ fontSize: '13px', color: '#e50914', textDecoration: 'none' }}>Shiko të gjitha →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
              {movies.map((m: any) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </div>
        )}

      </div>

      <Footer />
    </div>
  )
}