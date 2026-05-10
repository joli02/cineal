'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MovieCard, { TrendingCard } from '@/components/movie/MovieCard'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const GENRES = ['Aksion', 'Drama', 'Sci-Fi', 'Thriller', 'Horror', 'Comedy', 'Anime', 'Romance', 'Dokumentar', 'Seriale']

export default function HomePage() {
  const [movies, setMovies] = useState<any[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMovies() {
      try {
        const { data } = await supabase
          .from('movies')
          .select('*')
          .eq('status', 'live')
          .order('created_at', { ascending: false })
          .limit(100)
        if (data) {
          setMovies(data)
          const tr = data.filter((m: any) => m.is_trending)
          setTrending(tr.length > 0 ? tr.slice(0, 5) : data.slice(0, 5))
        }
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    fetchMovies()
  }, [])

  const featured = movies[0]

  const moviesByGenre = GENRES.map(genre => ({
    genre,
    movies: movies.filter(m => m.genre === genre).slice(0, 10)
  })).filter(g => g.movies.length > 0)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* HERO */}
      {featured && (
        <div style={{ position: 'relative', height: 'clamp(300px, 60vh, 600px)', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${featured.backdrop_url || featured.poster_url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(0.4)'
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(10,10,15,0.95) 40%, transparent 100%)'
          }} />
          <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(60px, 10vw, 120px) clamp(20px, 5vw, 60px) 40px', maxWidth: '600px' }}>
            <div style={{ fontSize: '11px', color: '#e50914', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Film i Ri
            </div>
            <h1 style={{ fontSize: 'clamp(24px, 5vw, 42px)', fontWeight: 700, lineHeight: 1.1, marginBottom: '12px' }}>
              {featured.title_sq || featured.title}
            </h1>
            <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#b0b0c0', marginBottom: '16px', flexWrap: 'wrap' }}>
              {featured.year && <span>{featured.year}</span>}
              {featured.genre && <><span>•</span><span>{featured.genre}</span></>}
              {featured.rating && <><span>•</span><span>★ {featured.rating}</span></>}
              {featured.duration && <><span>•</span><span>{featured.duration}</span></>}
            </div>
            {featured.description && (
              <p style={{ fontSize: '14px', color: '#b0b0c0', lineHeight: 1.6, marginBottom: '24px', maxWidth: '500px' }}>
                {featured.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href={`/film/${featured.slug}?play=true`} style={{
                background: '#e50914', color: '#fff', padding: '10px 24px',
                borderRadius: '5px', textDecoration: 'none', fontWeight: 600, fontSize: '14px'
              }}>
                ▶ Shiko Tani
              </Link>
              <Link href={`/film/${featured.slug}`} style={{
                background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '10px 24px',
                borderRadius: '5px', textDecoration: 'none', fontWeight: 500, fontSize: '14px',
                border: '1px solid rgba(255,255,255,0.15)'
              }}>
                + Më Shumë
              </Link>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 60px)' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b6b80' }}>
            Duke ngarkuar filmat...
          </div>
        )}

        {!loading && movies.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
            <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>Nuk ka filma akoma</div>
            <div style={{ fontSize: '14px', color: '#6b6b80' }}>Shto filmat e parë nga Admin Panel</div>
          </div>
        )}

        {/* TRENDING */}
        {trending.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600 }}>TRENDING</h2>
              <Link href="/trending" style={{ fontSize: '13px', color: '#e50914', textDecoration: 'none' }}>Shiko të gjitha →</Link>
            </div>
            {/* Desktop grid / Mobile scroll */}
            <div className="category-scroll">
              {trending.map((m: any, i: number) => (
                <div key={m.id} className="category-item-trending">
                  <TrendingCard movie={m} index={i} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TË GJITHA FILMAT */}
        {movies.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600 }}>Të Gjitha Filmat</h2>
              <Link href="/filma" style={{ fontSize: '13px', color: '#e50914', textDecoration: 'none' }}>Shiko të gjitha →</Link>
            </div>
            <div className="category-scroll">
              {movies.slice(0, 10).map((m: any) => (
                <div key={m.id} className="category-item">
                  <MovieCard movie={m} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SIPAS ZHANRIT */}
        {moviesByGenre.map(({ genre, movies: gMovies }) => (
          <div key={genre} style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600 }}>
                {genre}
              </h2>
              <Link href={genre === 'Anime' ? '/anime' : genre === 'Seriale' ? '/seriale' : `/filma`}
                style={{ fontSize: '13px', color: '#e50914', textDecoration: 'none' }}>
                Shiko të gjitha →
              </Link>
            </div>
            <div className="category-scroll">
              {gMovies.map((m: any) => (
                <div key={m.id} className="category-item">
                  <MovieCard movie={m} />
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>

      <Footer />

      <style>{`
        /* Desktop: grid normale */
        .category-scroll {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
        }
        .category-item-trending {
          width: 100%;
        }
        .category-item {
          width: 100%;
        }

        /* Mobile: scroll horizontal, 2 posterat visible */
        @media (max-width: 768px) {
          .category-scroll {
            display: flex;
            flex-direction: row;
            overflow-x: auto;
            gap: 10px;
            padding-bottom: 8px;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            grid-template-columns: unset;
          }
          .category-scroll::-webkit-scrollbar {
            display: none;
          }
          .category-item {
            flex: 0 0 calc(50% - 5px);
            min-width: calc(50% - 5px);
            scroll-snap-align: start;
          }
          .category-item-trending {
            flex: 0 0 calc(80% - 5px);
            min-width: calc(80% - 5px);
            scroll-snap-align: start;
          }
        }
      `}</style>
    </div>
  )
}
