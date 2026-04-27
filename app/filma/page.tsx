'use client'
import { useState, useMemo } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MovieCard from '@/components/movie/MovieCard'

const ALL_MOVIES: any[] = [
  { id:'1', title:'Inception', slug:'inception', year:2010, genre:'Sci-Fi', rating:8.8, poster_url:'https://image.tmdb.org/t/p/w300/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 28min', status:'live', created_at:'' },
  { id:'2', title:'The Dark Knight', slug:'the-dark-knight', year:2008, genre:'Aksion', rating:9.0, poster_url:'https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 32min', status:'live', created_at:'' },
  { id:'3', title:'Interstellar', slug:'interstellar', year:2014, genre:'Sci-Fi', rating:8.6, poster_url:'https://image.tmdb.org/t/p/w300/gEU2QniE6E77NI6lCU6MxlNBvIE.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 49min', status:'live', created_at:'' },
  { id:'4', title:'Pulp Fiction', slug:'pulp-fiction', year:1994, genre:'Thriller', rating:8.9, poster_url:'https://image.tmdb.org/t/p/w300/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 34min', status:'live', created_at:'' },
  { id:'5', title:'Dune: Part Two', slug:'dune-part-two', year:2024, genre:'Sci-Fi', rating:8.5, poster_url:'https://image.tmdb.org/t/p/w300/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', backdrop_url:'', subtitle_url:'', embed_url:'', description_sq:'', duration:'2h 46min', status:'live', created_at:'' },
  { id:'6', title:'Furiosa', slug:'furiosa', year:2024, genre:'Aksion', rating:7.8, poster_url:'https://image.tmdb.org/t/p/w300/iADOJ8Zymht2JPMoy3R7xceZprc.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 28min', status:'live', created_at:'' },
  { id:'7', title:'Oppenheimer', slug:'oppenheimer', year:2023, genre:'Drama', rating:8.5, poster_url:'https://image.tmdb.org/t/p/w300/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'3h', status:'live', created_at:'' },
  { id:'8', title:'Joker', slug:'joker', year:2019, genre:'Drama', rating:8.4, poster_url:'https://image.tmdb.org/t/p/w300/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 2min', status:'live', created_at:'' },
  { id:'9', title:'Parasite', slug:'parasite', year:2019, genre:'Thriller', rating:8.5, poster_url:'https://image.tmdb.org/t/p/w300/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 12min', status:'live', created_at:'' },
  { id:'10', title:'Top Gun: Maverick', slug:'top-gun-maverick', year:2022, genre:'Aksion', rating:8.3, poster_url:'https://image.tmdb.org/t/p/w300/mavMi1zf4UwgABL5e4aCCFQKdnf.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 11min', status:'live', created_at:'' },
  { id:'11', title:'One Piece Film: Red', slug:'one-piece-red', year:2022, genre:'Anime', rating:7.6, poster_url:'https://image.tmdb.org/t/p/w300/yXNNxnJ3MuJ0FkJUmqDQpw2zqBg.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'1h 55min', status:'live', created_at:'' },
  { id:'12', title:'Demon Slayer: Mugen', slug:'demon-slayer-mugen', year:2020, genre:'Anime', rating:8.3, poster_url:'https://image.tmdb.org/t/p/w300/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'1h 57min', status:'live', created_at:'' },
  { id:'13', title:'The Batman', slug:'the-batman', year:2022, genre:'Aksion', rating:7.9, poster_url:'https://image.tmdb.org/t/p/w300/74xTEgt7R36Fpooo50r9T25onhq.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 56min', status:'live', created_at:'' },
  { id:'14', title:'The Shawshank Redemption', slug:'shawshank', year:1994, genre:'Drama', rating:9.3, poster_url:'https://image.tmdb.org/t/p/w300/lyQBXzOQSuE59IsHyhrp0qIiPAz.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 22min', status:'live', created_at:'' },
  { id:'15', title:'Uncharted', slug:'uncharted', year:2022, genre:'Aksion', rating:6.5, poster_url:'https://image.tmdb.org/t/p/w300/rERrSbziEGJPkXkRJpBMxS0GDCK.jpg', backdrop_url:'', subtitle_url:'', embed_url:'', description_sq:'', duration:'1h 56min', status:'live', created_at:'' },
  { id:'16', title:'Glass Onion', slug:'glass-onion', year:2022, genre:'Thriller', rating:7.1, poster_url:'https://image.tmdb.org/t/p/w300/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 19min', status:'live', created_at:'' },
]

const GENRES = ['Të gjitha', 'Aksion', 'Drama', 'Sci-Fi', 'Thriller', 'Horror', 'Comedy', 'Anime', 'Romance']

export default function FilmaPage() {
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('Të gjitha')
  const [sort, setSort] = useState('Më të rinjtë')

  const filtered = useMemo(() => {
    let list = [...ALL_MOVIES]
    if (genre !== 'Të gjitha') list = list.filter(m => m.genre === genre)
    if (search) list = list.filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
    if (sort === 'Më të vlerësuarit') list.sort((a, b) => b.rating - a.rating)
    else if (sort === 'Sipas titullit A-Z') list.sort((a, b) => a.title.localeCompare(b.title))
    else if (sort === 'Sipas vitit') list.sort((a, b) => b.year - a.year)
    else list.sort((a, b) => b.year - a.year)
    return list
  }, [search, genre, sort])

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <div style={{ padding: '32px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '3px' }}>Të Gjithë Filmat</h1>
          <p style={{ fontSize: '13px', color: '#6b6b80', marginTop: '4px' }}>{filtered.length} filma me titra shqip</p>
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', color: '#b0b0c0', padding: '8px 14px', borderRadius: '5px', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", outline: 'none', cursor: 'pointer' }}
        >
          <option>Më të rinjtë</option>
          <option>Më të vlerësuarit</option>
          <option>Sipas titullit A-Z</option>
          <option>Sipas vitit</option>
        </select>
      </div>

      {/* Search */}
      <div style={{ padding: '16px 32px 0' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b6b80', pointerEvents: 'none' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Kërko filma, seriale, anime..."
            style={{
              width: '100%',
              background: '#12121a',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
              padding: '12px 16px 12px 44px',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Genre filters */}
      <div style={{ padding: '14px 32px 0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {GENRES.map(g => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            style={{
              background: genre === g ? '#e50914' : 'rgba(255,255,255,0.05)',
              border: genre === g ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.08)',
              color: genre === g ? '#fff' : '#b0b0c0',
              padding: '7px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.2s',
            }}
          >{g}</button>
        ))}
      </div>

      {/* Results count */}
      <div style={{ padding: '12px 32px 0', fontSize: '13px', color: '#6b6b80' }}>
        Gjetur: <span style={{ color: '#b0b0c0' }}>{filtered.length}</span> filma
      </div>

      {/* Grid */}
      <div style={{ padding: '16px 32px 40px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px' }}>
        {filtered.map(m => <MovieCard key={m.id} movie={m} />)}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#6b6b80' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎬</div>
            <div>Nuk u gjet asnjë film për "{search}"</div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
