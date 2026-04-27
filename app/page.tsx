'use client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MovieCard, { TrendingCard } from '@/components/movie/MovieCard'
import Link from 'next/link'

const hero = {
  title: 'Furiosa: A Mad Max Saga', year: 2024, duration: '2h 28min', rating: 7.8, genre: 'Aksion',
  description_sq: 'Udhëtimi epik i luftëtares Furiosa nëpër botën post-apokaliptike, duke sfiduar tiranin e fuqishëm për të rikërkuar atdheun.',
  backdrop_url: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
  poster_url: 'https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg', slug: 'furiosa',
}

const DEMO_MOVIES = [
  { id:'1', title:'Inception', slug:'inception', year:2010, genre:'Sci-Fi', rating:8.8, poster_url:'https://image.tmdb.org/t/p/w300/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 28min', status:'live', created_at:'' },
  { id:'2', title:'The Dark Knight', slug:'the-dark-knight', year:2008, genre:'Aksion', rating:9.0, poster_url:'https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 32min', status:'live', created_at:'' },
  { id:'3', title:'Interstellar', slug:'interstellar', year:2014, genre:'Sci-Fi', rating:8.6, poster_url:'https://image.tmdb.org/t/p/w300/gEU2QniE6E77NI6lCU6MxlNBvIE.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 49min', status:'live', created_at:'' },
  { id:'4', title:'Oppenheimer', slug:'oppenheimer', year:2023, genre:'Drama', rating:8.5, poster_url:'https://image.tmdb.org/t/p/w300/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'3h', status:'live', created_at:'' },
  { id:'5', title:'Dune: Part Two', slug:'dune-part-two', year:2024, genre:'Sci-Fi', rating:8.5, poster_url:'https://image.tmdb.org/t/p/w300/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', backdrop_url:'', subtitle_url:'', embed_url:'', description_sq:'', duration:'2h 46min', status:'live', created_at:'' },
  { id:'6', title:'Furiosa', slug:'furiosa', year:2024, genre:'Aksion', rating:7.8, poster_url:'https://image.tmdb.org/t/p/w300/iADOJ8Zymht2JPMoy3R7xceZprc.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 28min', status:'live', created_at:'' },
  { id:'7', title:'Joker', slug:'joker', year:2019, genre:'Drama', rating:8.4, poster_url:'https://image.tmdb.org/t/p/w300/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 2min', status:'live', created_at:'' },
  { id:'8', title:'Top Gun: Maverick', slug:'top-gun-maverick', year:2022, genre:'Aksion', rating:8.3, poster_url:'https://image.tmdb.org/t/p/w300/mavMi1zf4UwgABL5e4aCCFQKdnf.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 11min', status:'live', created_at:'' },
  { id:'9', title:'One Piece Film: Red', slug:'one-piece-red', year:2022, genre:'Anime', rating:7.6, poster_url:'https://image.tmdb.org/t/p/w300/yXNNxnJ3MuJ0FkJUmqDQpw2zqBg.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'1h 55min', status:'live', created_at:'' },
  { id:'10', title:'Demon Slayer: Mugen', slug:'demon-slayer-mugen', year:2020, genre:'Anime', rating:8.3, poster_url:'https://image.tmdb.org/t/p/w300/h8Rb9gBr48ODIwYUttZNYeMWeUU.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'1h 57min', status:'live', created_at:'' },
  { id:'11', title:'Parasite', slug:'parasite', year:2019, genre:'Thriller', rating:8.5, poster_url:'https://image.tmdb.org/t/p/w300/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 12min', status:'live', created_at:'' },
  { id:'12', title:'The Batman', slug:'the-batman', year:2022, genre:'Aksion', rating:7.9, poster_url:'https://image.tmdb.org/t/p/w300/74xTEgt7R36Fpooo50r9T25onhq.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 56min', status:'live', created_at:'' },
] as any[]

const TRENDING = DEMO_MOVIES.slice(0, 5)
const sections = [
  { title: 'Filma Aksion', href: '/filma?zhanri=Aksion', movies: DEMO_MOVIES.filter((m:any)=>m.genre==='Aksion').slice(0,6) },
  { title: 'Anime', href: '/anime', movies: DEMO_MOVIES.filter((m:any)=>m.genre==='Anime').slice(0,6) },
  { title: 'Top Rated', href: '/filma?sort=rating', movies: [...DEMO_MOVIES].sort((a:any,b:any)=>b.rating-a.rating).slice(0,6) },
]

export default function HomePage() {
  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ position: 'relative', height: '480px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: '40px 32px' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(to right, rgba(10,10,15,0.95) 40%, rgba(10,10,15,0.3) 100%), url(${hero.backdrop_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a0f 0%, transparent 50%)' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '520px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.3)', color: '#ff6b6b', fontSize: '11px', fontWeight: 500, letterSpacing: '1.5px', padding: '4px 12px', borderRadius: '20px', marginBottom: '14px', textTransform: 'uppercase' }}>▶ Tani në Cineal</div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '52px', letterSpacing: '2px', lineHeight: 1, marginBottom: '12px' }}>{hero.title}</h1>
          <div style={{ display: 'flex', gap: '14px', marginBottom: '14px', alignItems: 'center' }}>
            <span style={{ color: '#f5a623', fontWeight: 500 }}>★ {hero.rating}</span>
            <span style={{ color: '#b0b0c0', fontSize: '13px' }}>{hero.year}</span>
            <span style={{ color: '#b0b0c0', fontSize: '13px' }}>{hero.duration}</span>
          </div>
          <p style={{ fontSize: '13px', color: '#b0b0c0', lineHeight: 1.7, marginBottom: '24px', maxWidth: '380px', fontWeight: 300 }}>{hero.description_sq}</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href={`/film/${hero.slug}`}><button className="btn-primary"><div style={{ width:0, height:0, borderTop:'7px solid transparent', borderBottom:'7px solid transparent', borderLeft:'12px solid #fff' }} />Shiko Tani</button></Link>
            <Link href={`/film/${hero.slug}`}><button className="btn-secondary">+ Më Shumë</button></Link>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 32px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '2px' }}>TRENDING</span>
          <Link href="/trending" style={{ fontSize: '12px', color: '#6b6b80', textDecoration: 'none' }}>Shiko të gjitha →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
          {TRENDING.map((m:any, i:number) => <TrendingCard key={m.id} movie={m} index={i} />)}
        </div>
      </div>

      {sections.map(sec => (
        <div key={sec.title} style={{ padding: '28px 32px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '2px' }}>{sec.title}</span>
            <Link href={sec.href} style={{ fontSize: '12px', color: '#6b6b80', textDecoration: 'none' }}>Shiko të gjitha →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
            {sec.movies.map((m:any) => <MovieCard key={m.id} movie={m} />)}
          </div>
        </div>
      ))}
      <Footer />
    </div>
  )
}
