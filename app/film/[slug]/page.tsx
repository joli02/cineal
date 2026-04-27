'use client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MovieCard from '@/components/movie/MovieCard'
import VideoPlayer from '@/components/player/VideoPlayer'
import Link from 'next/link'

// Demo movie data - replace with: getMovieBySlug(params.slug)
const DEMO: any = {
  id: '1', slug: 'furiosa', title: 'Furiosa: A Mad Max Saga',
  title_sq: 'Furiosa: Saga e Mad Max',
  year: 2024, duration: '2h 28min', genre: 'Aksion', rating: 7.8,
  description_sq: 'Kur Furiosa rrëmbehet nga Hordi e Humbur dhe bie në duart e Tiranit Dementus, ajo niset në një udhëtim epik për mbijetesë dhe hakmarrje nëpër Shkretëtirën post-apokaliptike. Një saga e fuqishme mbi identitetin, lirinë dhe çmimin e luftës.',
  poster_url: 'https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg',
  backdrop_url: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
  embed_url: 'https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID',
  subtitle_url: '/subs/furiosa-sq.vtt',
  status: 'live', created_at: '',
}

const SIMILAR: any[] = [
  { id:'2', title:'Mad Max: Fury Road', slug:'mad-max-fury-road', year:2015, genre:'Aksion', rating:8.1, poster_url:'https://image.tmdb.org/t/p/w300/bttWooFK4kNT6XgxIgcPD3fFKef.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h', status:'live', created_at:'' },
  { id:'3', title:'Dune: Part One', slug:'dune-part-one', year:2021, genre:'Sci-Fi', rating:7.9, poster_url:'https://image.tmdb.org/t/p/w300/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 35min', status:'live', created_at:'' },
  { id:'4', title:'Top Gun: Maverick', slug:'top-gun-maverick', year:2022, genre:'Aksion', rating:8.3, poster_url:'https://image.tmdb.org/t/p/w300/mavMi1zf4UwgABL5e4aCCFQKdnf.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'2h 11min', status:'live', created_at:'' },
  { id:'5', title:'The Gray Man', slug:'the-gray-man', year:2022, genre:'Aksion', rating:6.5, poster_url:'https://image.tmdb.org/t/p/w300/oGythE98MYleE6mZlGs5oBGkux1.jpg', backdrop_url:'', subtitle_url:'', embed_url:'', description_sq:'', duration:'2h 2min', status:'live', created_at:'' },
  { id:'6', title:'Road House', slug:'road-house', year:2024, genre:'Aksion', rating:7.1, poster_url:'https://image.tmdb.org/t/p/w300/iuFNMS8vlSbVOwnMiZTpYZSMDMZ.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'1h 54min', status:'live', created_at:'' },
  { id:'7', title:'Uncharted', slug:'uncharted', year:2022, genre:'Aksion', rating:6.5, poster_url:'https://image.tmdb.org/t/p/w300/rERrSbziEGJPkXkRJpBMxS0GDCK.jpg', backdrop_url:'', subtitle_url:'/sq.vtt', embed_url:'', description_sq:'', duration:'1h 56min', status:'live', created_at:'' },
]

export default function FilmPage({ params }: { params: { slug: string } }) {
  const movie = DEMO // replace with: await getMovieBySlug(params.slug)

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar />

      {/* BACKDROP */}
      <div style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${movie.backdrop_url})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,10,15,0.2) 0%, rgba(10,10,15,0.7) 60%, #0a0a0f 100%)' }} />
        <div style={{ position: 'absolute', top: '20px', left: '32px', fontSize: '12px', color: '#6b6b80', display: 'flex', gap: '8px' }}>
          <Link href="/" style={{ color: '#6b6b80', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/filma" style={{ color: '#6b6b80', textDecoration: 'none' }}>Filma</Link>
          <span>›</span>
          <span style={{ color: '#b0b0c0' }}>{movie.title}</span>
        </div>
      </div>

      {/* MOVIE INFO */}
      <div style={{
        padding: '0 32px',
        marginTop: '-60px',
        position: 'relative',
        zIndex: 2,
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        gap: '32px',
        alignItems: 'start',
      }}>
        {/* POSTER */}
        <div style={{ position: 'relative' }}>
          <img
            src={movie.poster_url}
            alt={movie.title}
            style={{ width: '220px', height: '330px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', display: 'block' }}
          />
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(0,0,0,0.8)', border: '1px solid #f5a623',
            color: '#f5a623', fontSize: '12px', fontWeight: 500, padding: '4px 8px', borderRadius: '4px',
          }}>★ {movie.rating}</div>
        </div>

        {/* INFO */}
        <div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="genre-tag">{movie.genre}</span>
            <span className="genre-tag">Aventurë</span>
          </div>

          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', letterSpacing: '2px', lineHeight: 1, marginBottom: '8px' }}>
            {movie.title}
          </h1>
          <p style={{ fontSize: '14px', color: '#6b6b80', fontStyle: 'italic', marginBottom: '14px', fontWeight: 300 }}>
            Me Titra Shqip — HD 1080p
          </p>

          <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: '#f5a623', fontWeight: 500, fontSize: '15px' }}>★ {movie.rating}</span>
            <span style={{ color: '#b0b0c0', fontSize: '13px' }}>{movie.year}</span>
            <span style={{ color: '#b0b0c0', fontSize: '13px' }}>{movie.duration}</span>
            <span style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: '3px', fontSize: '11px', color: '#b0b0c0' }}>HD</span>
            {movie.subtitle_url && (
              <span style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)', color: '#f5a623', padding: '3px 10px', borderRadius: '3px', fontSize: '11px' }}>SQ Titra</span>
            )}
          </div>

          <p style={{ fontSize: '14px', color: '#b0b0c0', lineHeight: 1.8, marginBottom: '24px', maxWidth: '600px', fontWeight: 300 }}>
            {movie.description_sq}
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a href="#player">
              <button className="btn-primary" style={{ fontSize: '15px', padding: '13px 32px' }}>
                <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid #fff' }} />
                Shiko Tani
              </button>
            </a>
            <button className="btn-secondary" style={{ fontSize: '15px', padding: '13px 24px' }}>▶ Trailer</button>
            <button className="btn-secondary" style={{ width: '44px', padding: '13px', justifyContent: 'center' }}>♡</button>
          </div>
        </div>
      </div>

      {/* PLAYER */}
      <div id="player" style={{ padding: '32px 32px 0' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '2px', marginBottom: '14px' }}>
          ▶ Shiko Filmin
        </div>
        <VideoPlayer movie={movie} />
      </div>

      {/* SIMILAR */}
      <div style={{ padding: '28px 32px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '2px' }}>Filma të Ngjashëm</div>
          <Link href="/filma" style={{ fontSize: '12px', color: '#6b6b80', textDecoration: 'none' }}>Shiko të gjitha →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
          {SIMILAR.map(m => <MovieCard key={m.id} movie={m} />)}
        </div>
      </div>

      <Footer />
    </div>
  )
}
