'use client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MovieCard from '@/components/movie/MovieCard'

const SERIALE = [
  { id:'1', title:'Game of Thrones', slug:'game-of-thrones', year:2011, genre:'Seriale', rating:9.2, poster_url:'https://image.tmdb.org/t/p/w300/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'~60min/ep', status:'live', created_at:'' },
  { id:'2', title:'Breaking Bad', slug:'breaking-bad', year:2008, genre:'Seriale', rating:9.5, poster_url:'https://image.tmdb.org/t/p/w300/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'~47min/ep', status:'live', created_at:'' },
  { id:'3', title:'Peaky Blinders', slug:'peaky-blinders', year:2013, genre:'Seriale', rating:8.8, poster_url:'https://image.tmdb.org/t/p/w300/vNpuAxGTl9HsUbHqam3QTy9C2yX.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'~60min/ep', status:'live', created_at:'' },
  { id:'4', title:'The Boys', slug:'the-boys', year:2019, genre:'Seriale', rating:8.7, poster_url:'https://image.tmdb.org/t/p/w300/stTEycfG9928HYGEISBFaG1ngjM.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'~60min/ep', status:'live', created_at:'' },
  { id:'5', title:'Ozark', slug:'ozark', year:2017, genre:'Seriale', rating:8.4, poster_url:'https://image.tmdb.org/t/p/w300/pCGyPVrI9Fzc6UdizVTFSvSc9Nx.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'~60min/ep', status:'live', created_at:'' },
  { id:'6', title:'Money Heist', slug:'money-heist', year:2017, genre:'Seriale', rating:8.2, poster_url:'https://image.tmdb.org/t/p/w300/reEMJA1uzscCbkipeJt2fmEKPTI.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'~50min/ep', status:'live', created_at:'' },
] as any[]

export default function SerialsPage() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '32px 32px 0' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '3px', marginBottom: '4px' }}>Seriale</h1>
        <p style={{ fontSize: '13px', color: '#6b6b80', marginBottom: '24px' }}>Seriale me titra shqip — cilësi HD</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', paddingBottom: '40px' }}>
          {SERIALE.map((m:any) => <MovieCard key={m.id} movie={m} />)}
        </div>
      </div>
      <Footer />
    </div>
  )
}
