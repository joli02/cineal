'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MovieCard, { TrendingCard } from '@/components/movie/MovieCard'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const GENRES = ['Aksion', 'Drama', 'Sci-Fi', 'Thriller', 'Horror', 'Comedy', 'Anime', 'Romance', 'Dokumentar']

export default function HomePage() {
  const [movies, setMovies] = useState<any[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [continueWatching, setContinueWatching] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchContinueWatching(session.user.id)
    })
  }, [])

  async function fetchContinueWatching(userId: string) {
    const { data } = await supabase
      .from('watch_history')
      .select('movie_id, progress_seconds, watched_at, movies(*)')
      .eq('user_id', userId)
      .gt('progress_seconds', 30)
      .order('watched_at', { ascending: false })
      .limit(10)
    if (data) {
      const cwMovies = data
        .filter((d: any) => d.movies)
        .map((d: any) => ({ ...d.movies, progress_seconds: d.progress_seconds }))
      setContinueWatching(cwMovies)
    }
  }

  const removeFromContinueWatching = async (movieId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    await supabase.from('watch_history').delete().eq('user_id', user.id).eq('movie_id', movieId)
    setContinueWatching(prev => prev.filter(m => m.id !== movieId))
  }

  useEffect(() => {
    async function fetchMovies() {
      try {
        const { data } = await supabase
          .from('movies')
          .select('*')
          .eq('status', 'live')
          .eq('is_kids', false)
          .order('created_at', { ascending: false })
          .limit(100)
        if (data) {
          setMovies(data)
          const tr = data.filter((m: any) => m.is_trending)
          setTrending(tr.length > 0 ? tr.slice(0, 5) : data.slice(0, 5))
        }
      } catch (e) { console.error(e) }
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
        <div style={{ position: 'relative', height: 'clamp(500px, 80vh, 800px)', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${featured.backdrop_url || featured.poster_url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(1)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(10,10,15,0.98) 30%, rgba(10,10,15,0.7) 55%, rgba(10,10,15,0.2) 80%, transparent 100%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, #0a0a0f 0%, transparent 50%)',
          }} />
          <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(80px, 12vw, 140px) clamp(20px, 5vw, 60px) 40px', maxWidth: '580px' }}>
            <div style={{ fontSize: '11px', color: '#e50914', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Film i Ri</div>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, lineHeight: 1.1, marginBottom: '12px' }}>
              {featured.title_sq || featured.title}
            </h1>
            <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#b0b0c0', marginBottom: '16px', flexWrap: 'wrap' }}>
              {featured.year && <span>{featured.year}</span>}
              {featured.genre && <><span>•</span><span>{featured.genre}</span></>}
              {featured.rating && <><span>•</span><span>★ {featured.rating}</span></>}
              {featured.duration && <><span>•</span><span>{featured.duration}</span></>}
            </div>
            {featured.description && (
              <p style={{ fontSize: '14px', color: '#b0b0c0', lineHeight: 1.6, marginBottom: '24px', maxWidth: '460px' }}>
                {featured.description.substring(0, 160)}{featured.description.length > 160 ? '...' : ''}
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href={`/film/${featured.slug}?play=true`} style={{ background: '#e50914', color: '#fff', padding: '11px 26px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                ▶ Shiko Tani
              </Link>
              <Link href={`/film/${featured.slug}`} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '11px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: 500, fontSize: '14px', border: '1px solid rgba(255,255,255,0.15)' }}>
                + Më Shumë
              </Link>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 60px)' }}>

        {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#6b6b80' }}>Duke ngarkuar filmat...</div>}

        {/* CONTINUE WATCHING */}
        {user && continueWatching.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600, marginBottom: '16px' }}>Vazhdo Shikimin</h2>
            <div className="trending-scroll">
              {continueWatching.map((m: any) => (
                <div key={m.id} className="trending-item">
                  <div style={{ position: 'relative' }}>
                    {/* Butoni X */}
                    <button
                      onClick={(e) => removeFromContinueWatching(m.id, e)}
                      style={{
                        position: 'absolute', top: '6px', right: '6px', zIndex: 10,
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff', fontSize: '14px', lineHeight: 1,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'sans-serif',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(229,9,20,0.8)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.7)')}
                    >
                      ✕
                    </button>

                    <Link href={`/film/${m.slug}?play=true`} style={{ textDecoration: 'none' }}>
                      <div style={{ borderRadius: '8px', overflow: 'hidden', background: '#12121a', cursor: 'pointer', position: 'relative' }}>
                        {m.poster_url
                          ? <img src={m.poster_url} alt={m.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
                          : <div style={{ width: '100%', aspectRatio: '16/9', background: '#1a1a2e' }} />
                        }
                        {/* Gradient i zi nga fundi */}
                        <div style={{
                          position: 'absolute', bottom: '3px', left: 0, right: 0, height: '60px',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                          pointerEvents: 'none',
                        }} />
                        {/* Progress bar */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.15)' }}>
                          <div style={{ height: '100%', background: '#e50914', width: `${Math.min(100, (m.progress_seconds / 7200) * 100)}%` }} />
                        </div>
                        <div style={{ padding: '8px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title_sq || m.title}</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRENDING */}
        {trending.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600, marginBottom: '16px' }}>Trending</h2>
            <div className="trending-scroll">
              {trending.map((m: any, i: number) => (
                <div key={m.id} className="trending-item">
                  <TrendingCard movie={m} index={i} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SIPAS ZHANRIT */}
        {moviesByGenre.map(({ genre, movies: gMovies }) => (
          <div key={genre} style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600 }}>{genre}</h2>
              <Link href={`/filma?zhanri=${genre}`} style={{ fontSize: '13px', color: '#e50914', textDecoration: 'none' }}>
                Shiko të gjitha →
              </Link>
            </div>
            <div className="trending-scroll">
              {gMovies.map((m: any) => (
                <div key={m.id} className="trending-item">
                  <MovieCard movie={m} />
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>

      <Footer />

      <style>{`
        .category-scroll {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
        }
        .category-item { width: 100%; }

        .trending-scroll {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 14px;
        }
        .trending-item { width: 100%; }

        @media (max-width: 768px) {
          .category-scroll {
            display: flex;
            overflow-x: auto;
            gap: 10px;
            padding-bottom: 8px;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            grid-template-columns: unset;
          }
          .category-scroll::-webkit-scrollbar { display: none; }
          .category-item {
            flex: 0 0 calc(50% - 5px);
            min-width: calc(50% - 5px);
            scroll-snap-align: start;
          }
          .trending-scroll {
            display: flex;
            overflow-x: auto;
            gap: 12px;
            padding-bottom: 8px;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            grid-template-columns: unset;
          }
          .trending-scroll::-webkit-scrollbar { display: none; }
          .trending-item {
            flex: 0 0 calc(70% - 6px);
            min-width: calc(70% - 6px);
            scroll-snap-align: start;
          }
        }
      `}</style>
    </div>
  )
}
