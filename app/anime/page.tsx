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
      <div style={{ padding: '32px 32px 0' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '3px', marginBottom: '4px' }}>Anime</h1>
        <p style={{ fontSize: '13px', color: '#6b6b80', marginBottom: '24px' }}>Anime me titra shqip — cilësi HD</p>
        {loading && <p style={{ color: '#6b6b80' }}>Duke ngarkuar...</p>}
        {!loading && movies.length === 0 && (
          <p style={{ color: '#6b6b80' }}>Nuk ka anime akoma.</p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', paddingBottom: '40px' }}>
          {movies.map((m: any) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}