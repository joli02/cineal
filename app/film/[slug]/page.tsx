'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import VideoPlayer from '@/components/player/VideoPlayer'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function FilmPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params?.slug as string
  const autoPlay = searchParams.get('play') === 'true'

  const [movie, setMovie] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [inWatchlist, setInWatchlist] = useState(false)
  const [msg, setMsg] = useState('')
  const [similar, setSimilar] = useState<any[]>([])
  const [playing, setPlaying] = useState(autoPlay)
  const [savedTime, setSavedTime] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  useEffect(() => {
    async function fetchMovie() {
      const { data } = await supabase.from('movies').select('*').eq('slug', slug).single()
      setMovie(data)
      setLoading(false)
      if (data) fetchSimilar(data.genre, data.id)
    }
    if (slug) fetchMovie()
  }, [slug])

  useEffect(() => {
    if (!user || !movie) return
    async function loadProgress() {
      const { data } = await supabase.from('watch_history').select('progress_seconds').eq('user_id', user.id).eq('movie_id', movie.id).maybeSingle()
      if (data?.progress_seconds) setSavedTime(data.progress_seconds)
    }
    loadProgress()
  }, [user, movie])

  async function fetchSimilar(genre: string, id: string) {
    const { data } = await supabase.from('movies').select('*').eq('status', 'live').eq('genre', genre).neq('id', id).limit(12)
    if (data) setSimilar(data)
  }

  useEffect(() => {
    if (!user || !movie) return
    supabase.from('watchlist').select('id').eq('user_id', user.id).eq('movie_id', movie.id).maybeSingle()
      .then(({ data }) => setInWatchlist(!!data))
  }, [user, movie])

  const toggleWatchlist = async () => {
    if (!user) { setMsg('Duhet të hysh!'); setTimeout(() => setMsg(''), 2000); return }
    if (inWatchlist) {
      await supabase.from('watchlist').delete().eq('user_id', user.id).eq('movie_id', movie.id)
      setInWatchlist(false); setMsg('U hoq!')
    } else {
      await supabase.from('watchlist').insert({ user_id: user.id, movie_id: movie.id })
      setInWatchlist(true); setMsg('U shtua!')
    }
    setTimeout(() => setMsg(''), 2000)
  }

  const handlePlay = async () => {
    setPlaying(true)
    if (user && movie) {
      await supabase.from('watch_history').upsert(
        { user_id: user.id, movie_id: movie.id, watched_at: new Date().toISOString() },
        { onConflict: 'user_id,movie_id' }
      )
    }
  }

  const handleTimeUpdate = useCallback(async (time: number) => {
    if (!user || !movie || time < 10) return
    if (Math.floor(time) % 10 === 0) {
      await supabase.from('watch_history').upsert(
        { user_id: user.id, movie_id: movie.id, progress_seconds: Math.floor(time), watched_at: new Date().toISOString() },
        { onConflict: 'user_id,movie_id' }
      )
    }
  }, [user, movie])

  const formatProgress = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
    return h > 0 ? `${h}h ${m}min` : `${m} min`
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6b80' }}>Duke ngarkuar...</div>
  )

  if (!movie) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: '18px', marginBottom: '8px' }}>Filmi nuk u gjet</div>
        <Link href="/" style={{ color: '#e50914', textDecoration: 'none' }}>Kthehu</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ position: 'relative', height: 'clamp(500px, 80vh, 800px)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${movie.backdrop_url || movie.poster_url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(1)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,15,0.98) 30%, rgba(10,10,15,0.7) 55%, rgba(10,10,15,0.2) 80%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a0f 0%, transparent 50%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(60px, 10vw, 100px) clamp(20px, 5vw, 60px) 40px', maxWidth: '580px' }}>
          <div style={{ fontSize: '11px', color: '#e50914', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>{movie.genre}</div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 42px)', fontWeight: 700, lineHeight: 1.1, marginBottom: '12px' }}>{movie.title_sq || movie.title}</h1>
          <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#b0b0c0', marginBottom: '16px', flexWrap: 'wrap' }}>
            {movie.year && <span>{movie.year}</span>}
            {movie.rating && <><span>•</span><span>★ {movie.rating}</span></>}
            {movie.duration && <><span>•</span><span>{movie.duration}</span></>}
          </div>
          {(movie.description_sq || movie.description) && (
            <p style={{ fontSize: '14px', color: '#b0b0c0', lineHeight: 1.6, marginBottom: '24px', maxWidth: '460px' }}>
              {(movie.description_sq || movie.description).substring(0, 500)}{(movie.description_sq || movie.description).length > 500 ? '...' : ''}
            </p>
          )}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {(movie.video_url || movie.embed_url) && !playing && (
              <button onClick={handlePlay}
                style={{ background: '#e50914', color: '#fff', border: 'none', padding: '11px 26px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                {savedTime > 30 ? `▶ Vazhdo nga ${formatProgress(savedTime)}` : '▶ Shiko Tani'}
              </button>
            )}
            <button onClick={toggleWatchlist}
              style={{ background: inWatchlist ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.1)', border: `1px solid ${inWatchlist ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.2)'}`, color: inWatchlist ? '#22c55e' : '#fff', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              {inWatchlist ? '✓ Watchlist' : '+ Watchlist'}
            </button>
            {msg && <span style={{ fontSize: '12px', color: '#22c55e', alignSelf: 'center' }}>{msg}</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '28px clamp(16px, 4vw, 60px) 60px' }}>

        {playing && (movie.video_url || movie.embed_url) && (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch', maxWidth: '100%' }}>

            {/* Player kolona */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <VideoPlayer movie={movie} onTimeUpdate={handleTimeUpdate} startTime={savedTime} />

              {/* Mobile ad box — vetëm mobile, 50% gjerësi */}
              <div className="mobile-ad-box">
                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '11px' }}>Hapësirë për reklamë</span>
              </div>

              {/* Njoftim poshtë playerit */}
              <div style={{ marginTop: '10px', background: '#12121a', border: '1px solid rgba(229,9,20,0.2)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <p style={{ color: '#b0b0c0', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
                  Dëshiron të reklamosh biznesin tënd te mijëra shikues shqiptarë çdo ditë?
                </p>
                <a href="mailto:info@cineal.stream"
                  style={{ flexShrink: 0, background: '#e50914', color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  Na kontakto
                </a>
              </div>
            </div>

            {/* Ad boxes kolona — vetëm desktop */}
            <div className="ad-col-desktop" style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#12121a', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '10px', flex: 1, minHeight: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                </svg>
                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '11px' }}>Hapësirë për reklamë</span>
                <span style={{ color: 'rgba(255,255,255,0.08)', fontSize: '10px' }}>320 × auto px</span>
              </div>
              <div style={{ background: '#12121a', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '10px', height: '80px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '11px' }}>Hapësirë për reklamë</span>
                <span style={{ color: 'rgba(255,255,255,0.08)', fontSize: '10px' }}>320 × 80 px</span>
              </div>
            </div>
          </div>
        )}

        {/* Filma të ngjashëm */}
        {similar.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600, marginBottom: '16px' }}>Filma të Ngjashëm</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
              {similar.map((m: any) => (
                <Link key={m.id} href={`/film/${m.slug}?play=true`} style={{ textDecoration: 'none' }}>
                  <div style={{ borderRadius: '8px', overflow: 'hidden', background: '#12121a', cursor: 'pointer' }}>
                    {m.poster_url
                      ? <img src={m.poster_url} alt={m.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '100%', aspectRatio: '2/3', background: '#1a1a2e' }} />
                    }
                    <div style={{ padding: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#6b6b80' }}>{m.year}</span>
                        {m.rating && <span style={{ fontSize: '11px', color: '#f5a623' }}>★ {m.rating}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        /* Desktop: ad boxes visible */
        .ad-col-desktop {
          display: flex;
        }
        /* Mobile ad box: fshehur në desktop */
        .mobile-ad-box {
          display: none;
        }

        @media (max-width: 768px) {
          /* Fshi ad boxes në mobile */
          .ad-col-desktop {
            display: none !important;
          }
          /* Shfaq mobile ad box — 50% gjerësi */
          .mobile-ad-box {
  display: flex !important;
  width: 100%;
  height: 120px;
  background: #12121a;
  border: 1px dashed rgba(255,255,255,0.1);
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
          }
        }
      `}</style>
    </div>
  )
}
