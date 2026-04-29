'use client'
import { useState, useEffect, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MovieCard from '@/components/movie/MovieCard'
import { supabase } from '@/lib/supabase'

const GENRES = ['Të gjitha', 'Aksion', 'Drama', 'Sci-Fi', 'Thriller', 'Horror', 'Comedy', 'Anime', 'Romance', 'Dokumentar']

export default function FilmaPage() {
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('Të gjitha')
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
    if (genre !== 'Të gjitha') list = list.filter(m => m.genre === genre)
    if (search) list = list.filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'Më të vlerësuarit') list.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    else if (sort === 'Sipas titullit A-Z') list.sort((a, b) => a.title.localeCompare(b.title))
    else if (sort === 'Sipas vitit') list.sort((a, b) => (b.year || 0) - (a.year || 0))
    return list
  }, [movies, search, genre, sort])

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <div style={{ padding: '32px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '3px' }}>Të Gjithë Filmat</h1>
          <p style={{ fontSize: '13px', color: '#6b6b80', marginTop: '4px' }}>{filtered.length} filma me titra shqip</p>
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', color: '#b0b0c0', padding: '8px 14px', borderRadius: '5px', fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
          <option>Më të rinjtë</option>
          <option>Më të vlerësuarit</option>
          <option>Sipas titullit A-Z</option>
          <option>Sipas vitit</option>
        </select>
      </div>

      <div style={{ padding: '16px 32px 0' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b6b80' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Kërko filma..."
            style={{ width: '100%', background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', padding: '12px 16px 12px 44px', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }} />
        </div>
      </div>

      <div style={{ padding: '14px 32px 0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {GENRES.map(g => (
          <button key={g} onClick={() => setGenre(g)}
            style={{ background: genre === g ? '#e50914' : 'rgba(255,255,255,0.05)', border: genre === g ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.08)', color: genre === g ? '#fff' : '#b0b0c0', padding: '7px 16px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer' }}>
            {g}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 32px 0', fontSize: '13px', color: '#6b6b80' }}>
        Gjetur: <span style={{ color: '#b0b0c0' }}>{filtered.length}</span> filma
      </div>

      <div style={{ padding: '16px 32px 40px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px' }}>
        {loading && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#6b6b80' }}>Duke ngarkuar...</div>}
        {!loading && filtered.map(m => <MovieCard key={m.id} movie={m} />)}
        {!loading && filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#6b6b80' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎬</div>
            <div>Nuk u gjet asnjë film{search ? ` për "${search}"` : ''}</div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}