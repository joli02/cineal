'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MovieCard from '@/components/movie/MovieCard'
import { supabase } from '@/lib/supabase'

export default function AnimePage() {
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAnime() {
      const { data } = await supabase
        .from('movies')
        .select('*')
        .eq('status', 'live')
        .eq('genre', 'Anime')
        .order('created_at', { ascending: false })
      if (data) setMovies(data)
      setLoading(false)
    }
    fetchAnime()
  }, [])

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <div style={{ padding: 'clamp(16px, 4vw, 32px)' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(24px, 5vw, 32px)', letterSpacing: '3px', marginBottom: '4px' }}>Anime</h1>
        <p style={{ fontSize: '13px', color: '#6b6b80', marginBottom: '24px' }}>Anime me titra shqip — cilësi HD</p>

        {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#6b6b80' }}>Duke ngarkuar...</div>}

        {!loading && movies.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b6b80' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎬</div>
            <div>Nuk ka anime akoma.</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', paddingBottom: '40px' }}>
          {movies.map((m: any) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
