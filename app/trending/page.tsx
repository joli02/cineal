'use client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MovieCard from '@/components/movie/MovieCard'

const TRENDING = [
  { id:'1', title:'Dune: Part Two', slug:'dune-part-two', year:2024, genre:'Sci-Fi', rating:8.5, poster_url:'https://image.tmdb.org/t/p/w300/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', backdrop_url:'', subtitle_url:'', embed_url:'', description_sq:'', duration:'2h 46min', status:'live', created_at:'' },
  { id:'2', title:'Furiosa', slug:'furiosa', year:2024, genre:'Aksion', rating:7.8, poster_url:'https://image.tmdb.org/t/p/w300/iADOJ8Zymht2JPMoy3R7xceZprc.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 28min', status:'live', created_at:'' },
  { id:'3', title:'Oppenheimer', slug:'oppenheimer', year:2023, genre:'Drama', rating:8.5, poster_url:'https://image.tmdb.org/t/p/w300/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'3h', status:'live', created_at:'' },
  { id:'4', title:'The Dark Knight', slug:'the-dark-knight', year:2008, genre:'Aksion', rating:9.0, poster_url:'https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 32min', status:'live', created_at:'' },
  { id:'5', title:'Inception', slug:'inception', year:2010, genre:'Sci-Fi', rating:8.8, poster_url:'https://image.tmdb.org/t/p/w300/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 28min', status:'live', created_at:'' },
  { id:'6', title:'Parasite', slug:'parasite', year:2019, genre:'Thriller', rating:8.5, poster_url:'https://image.tmdb.org/t/p/w300/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 12min', status:'live', created_at:'' },
] as any[]

export default function TrendingPage() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '32px 32px 0' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '3px', marginBottom: '4px' }}>TRENDING</h1>
        <p style={{ fontSize: '13px', color: '#6b6b80', marginBottom: '24px' }}>Filmat më të ndjekur këtë javë</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', paddingBottom: '40px' }}>
          {TRENDING.map((m:any) => <MovieCard key={m.id} movie={m} />)}
        </div>
      </div>
      <Footer />
    </div>
  )
}
