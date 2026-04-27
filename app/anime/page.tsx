'use client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MovieCard from '@/components/movie/MovieCard'

const ANIME = [
  { id:'1', title:'One Piece Film: Red', slug:'one-piece-red', year:2022, genre:'Anime', rating:7.6, poster_url:'https://image.tmdb.org/t/p/w300/yXNNxnJ3MuJ0FkJUmqDQpw2zqBg.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'1h 55min', status:'live', created_at:'' },
  { id:'2', title:'Demon Slayer: Mugen Train', slug:'demon-slayer-mugen', year:2020, genre:'Anime', rating:8.3, poster_url:'https://image.tmdb.org/t/p/w300/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'1h 57min', status:'live', created_at:'' },
  { id:'3', title:'Jujutsu Kaisen 0', slug:'jujutsu-kaisen-0', year:2021, genre:'Anime', rating:7.9, poster_url:'https://image.tmdb.org/t/p/w300/23JGKR9HaGGOGS8FwKBJdQHzBIG.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'1h 45min', status:'live', created_at:'' },
  { id:'4', title:'Your Name', slug:'your-name', year:2016, genre:'Anime', rating:8.4, poster_url:'https://image.tmdb.org/t/p/w300/q719jXXEzOoYaps6babgKnONONX.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'1h 46min', status:'live', created_at:'' },
  { id:'5', title:'Spirited Away', slug:'spirited-away', year:2001, genre:'Anime', rating:8.6, poster_url:'https://image.tmdb.org/t/p/w300/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 5min', status:'live', created_at:'' },
  { id:'6', title:'Attack on Titan Final', slug:'attack-on-titan', year:2023, genre:'Anime', rating:9.0, poster_url:'https://image.tmdb.org/t/p/w300/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'~25min/ep', status:'live', created_at:'' },
] as any[]

export default function AnimePage() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '32px 32px 0' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '3px', marginBottom: '4px' }}>Anime</h1>
        <p style={{ fontSize: '13px', color: '#6b6b80', marginBottom: '24px' }}>Anime me titra shqip — cilësi HD</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', paddingBottom: '40px' }}>
          {ANIME.map((m:any) => <MovieCard key={m.id} movie={m} />)}
        </div>
      </div>
      <Footer />
    </div>
  )
}
