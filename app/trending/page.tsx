'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MovieCard from '@/components/movie/MovieCard'
import { supabase } from '@/lib/supabase'

export default function TrendingPage() {
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrending() {
      const { data } = await supabase
        .from('movies')
        .select('*')
        .eq('status', 'live')
        .eq('is_trending', true)
        .order('created_at', { ascending: false })
      if (data && data.length > 0) {
        setMovies(data)
      } else {
        const { data: all } = await supabase
          .from('movies')
          .select('*')
          .eq('status', 'live')
          .order('rating', { ascending: false })
          .limit(12)
        if (all) setMovies(all)
      }
      setLoading(false)
    }
    fetchTrending()
  }, [])

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ padding: '32px 32px 0' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '3px', marginBottom: '4px' }}>🔥 TRENDING</h1>
        <p style={{ fontSize: '13px', color: '#6b6b80', marginBottom: '24px' }}>Filmat më të ndjekur këtë javë</p>
        {loading && <p style={{ color: '#6b6b80' }}>Duke ngarkuar...</p>}
        {!loading && movies.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔥</div>
            <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>Nuk ka filma trending</div>
            <div style={{ fontSize: '13px', color: '#6b6b80' }}>Shto filma nga Admin Panel dhe aktivizo Trending</div>
          </div>
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