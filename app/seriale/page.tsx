'use client'
import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MovieCard from '@/components/movie/MovieCard'
import { supabase } from '@/lib/supabase'

const GENRES = ['Të gjitha', 'Aksion', 'Drama', 'Sci-Fi', 'Thriller', 'Horror', 'Comedy', 'Anime', 'Romance']

export default function SerialePage() {
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('Të gjitha')

  useEffect(() => {
    async function fetchSeriale() {
      const { data } = await supabase
        .from('movies')
        .select('*')
        .eq('status', 'live')
        .eq('genre', 'Seriale')
        .order('created_at', { ascending: false })
      if (data) setMovies(data)
      setLoading(false)
    }
    fetchSeriale()
  }, [])

  const filtered = useMemo(() => {
    let list = [...movies]
    if (genre !== 'Të gjitha') list = list.filter(m => m.genre === genre)
    if (search) list = list.filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
    return list
  }, [movies, search, genre])

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ padding: '32px 32px 0' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '3px', marginBottom: '4px' }}>Seriale</h1>
        <p style={{ fontSize: '13px', color: '#6b6b80', marginBottom: '16px' }}>Seriale me titra shqip — cilësi HD</p>

        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b6b80' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Kërko seriale..."
            style={{ width: '100%', background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '10px 16px 10px 44px', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const }} />
        </div>

        {loading && <p style={{ color: '#6b6b80' }}>Duke ngarkuar...</p>}

        {!loading && movies.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📺</div>
            <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>Nuk ka seriale akoma</div>
            <div style={{ fontSize: '13px', color: '#6b6b80' }}>Shto seriale nga Admin Panel me zhanër "Seriale"</div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', paddingBottom: '40px' }}>
          {filtered.map((m: any) => (
            <MovieCard key={m.id} movie={m} />
          ))}
          {!loading && filtered.length === 0 && search && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#6b6b80' }}>
              Nuk u gjet asnjë serial për "{search}"
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}