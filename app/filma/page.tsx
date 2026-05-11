'use client'
import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MovieCard from '@/components/movie/MovieCard'
import { supabase } from '@/lib/supabase'

const GENRES = ['Aksion', 'Drama', 'Sci-Fi', 'Thriller', 'Horror', 'Comedy', 'Anime', 'Romance', 'Dokumentar', 'Filma Shqip', 'Old Movies']

function FilmaContent() {
  const searchParams = useSearchParams()
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('kerko') || '')
  const [genre, setGenre] = useState(searchParams.get('zhanri') || '')
  const [sort, setSort] = useState('Më të rinjtë')

  useEffect(() => {
    async function fetchMovies() {
      const { data } = await supabase
        .from('movies')
        .select('*')
        .eq('status', 'live')
        .order('created_at', { ascending: false })
      if (data) setMovies(data)
      setLoading(false)
    }
    fetchMovies()
  }, [])

  const filtered = useMemo(() => {
    let list = [...movies]
    if (genre) list = list.filter(m => m.genre === genre)
    if (search) list = list.filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'Më të vlerësuarit') list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    else if (sort === 'Sipas vitit') list.sort((a, b) => (b.year || 0) - (a.year || 0))
    return list
  }, [movies, search, genre, sort])

  return (
    <div style={{ padding: 'clamp(16px, 4vw, 32px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(24px, 5vw, 32px)', letterSpacing: '3px', color: '#fff' }}>
          {genre || 'Filma'}
        </h1>
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', color: '#b0b0c0', padding: '8px 14px', borderRadius: '5px', fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
          <option>Më të rinjtë</option>
          <option>Më të vlerësuarit</option>
          <option>Sipas vitit</option>
        </select>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b6b80' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Kërko filma..."
          style={{ width: '100%', background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '10px 16px 10px 44px', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }} />
      </div>

      {/* Genre filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button onClick={() => setGenre('')}
          style={{ background: !genre ? '#e50914' : 'rgba(255,255,255,0.05)', border: !genre ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.08)', color: !genre ? '#fff' : '#b0b0c0', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}>
          Të gjitha
        </button>
        {GENRES.map(g => (
          <button key={g} onClick={() => setGenre(g)}
            style={{ background: genre === g ? '#e50914' : 'rgba(255,255,255,0.05)', border: genre === g ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.08)', color: genre === g ? '#fff' : '#b0b0c0', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}>
            {g}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#6b6b80' }}>Duke ngarkuar...</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', paddingBottom: '40px' }}>
        {!loading && filtered.map(m => <MovieCard key={m.id} movie={m} />)}
        {!loading && filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#6b6b80' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎬</div>
            <div>Nuk u gjet asnjë film{search ? ` për "${search}"` : ''}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FilmaPage() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center', color: '#6b6b80' }}>Duke ngarkuar...</div>}>
        <FilmaContent />
      </Suspense>
      <Footer />
    </div>
  )
}
