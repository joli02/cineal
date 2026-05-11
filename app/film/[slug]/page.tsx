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
      <div style={{ position: 'relative', height: 'clamp(200px, 40vh, 400px)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${movie.backdrop_url || movie.poster_url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.15)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a0f 0%, transparent 60%)' }} />
      </div>

      <div style={{ padding: '0 clamp(16px, 4vw, 60px) 60px', marginTop: 'clamp(-60px, -8vw, -100px)', position: 'relative', zIndex: 1 }}>

        <div style={{ display: 'flex', gap: 'clamp(16px, 3vw, 28px)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Poster — klikim direkt hap player */}
          {movie.poster_url && (
            <div style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }} onClick={handlePlay}>
              <img src={movie.poster_url} alt={movie.title}
                style={{ width: 'clamp(100px, 15vw, 160px)', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', display: 'block' }} />
              {/* Play icon overlay */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '8px',
                background: 'rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                <div style={{ width: '44px', height: '44px', background: 'rgba(229,9,20,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '14px solid #fff', marginLeft: '3px' }} />
                </div>
              </div>
            </div>
          )}

          <div style={{ flex: 1, minWidth: '200px', paddingTop: 'clamp(20px, 5vw, 40px)' }}>
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 34px)', fontWeight: 700, marginBottom: '8px' }}>
              {movie.title_sq || movie.title}
            </h1>
            <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#b0b0c0', marginBottom: '12px', flexWrap: 'wrap' }}>
              {movie.year && <span>{movie.year}</span>}
              {movie.genre && <><span>•</span><span>{movie.genre}</span></>}
              {movie.rating && <><span>•</span><span>★ {movie.rating}</span></>}
              {movie.duration && <><span>•</span><span>{movie.duration}</span></>}
            </div>
            {(movie.description_sq || movie.description) && (
              <p style={{ fontSize: '14px', color: '#b0b0c0', lineHeight: 1.7, maxWidth: '580px', marginBottom: '20px' }}>
                {movie.description_sq || movie.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {(movie.video_url || movie.embed_url) && !playing && (
                <button onClick={handlePlay}
                  style={{ background: '#e50914', color: '#fff', border: 'none', padding: '11px 26px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                  {savedTime > 30 ? `Vazhdo nga ${formatProgress(savedTime)}` : '▶ Shiko Tani'}
                </button>
              )}
              <button onClick={toggleWatchlist}
                style={{ background: inWatchlist ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)', border: `1px solid ${inWatchlist ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.2)'}`, color: inWatchlist ? '#22c55e' : '#fff', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                {inWatchlist ? '✓ Watchlist' : '+ Watchlist'}
              </button>
              {msg && <span style={{ fontSize: '12px', color: '#22c55e' }}>{msg}</span>}
            </div>
          </div>
        </div>

        {/* Player */}
        {playing && (movie.video_url || movie.embed_url) && (
          <div style={{ marginTop: '28px', maxWidth: '960px' }}>
            <VideoPlayer movie={movie} onTimeUpdate={handleTimeUpdate} />
          </div>
        )}

        {/* Similar movies */}
        {similar.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600, marginBottom: '16px' }}>Filma të Ngjashëm</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
              {similar.map((m: any) => (
                <Link key={m.id} href={`/film/${m.slug}?play=true`} style={{ textDecoration: 'none' }}>
                  <div style={{ borderRadius: '8px', overflow: 'hidden', background: '#12121a', cursor: 'pointer' }}>
                    {m.poster_url
                      ? <img src={m.poster_url} alt={m.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '100%', aspectRatio: '2/3', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎬</div>
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
    </div>
  )
}
