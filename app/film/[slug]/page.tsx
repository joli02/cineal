'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import CinealIntro from '@/components/CinealIntro'

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
  const [showIntro, setShowIntro] = useState(autoPlay) // auto-start nëse ?play=true
  const [playing, setPlaying] = useState(false)

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

  async function fetchSimilar(genre: string, id: string) {
    const { data } = await supabase
      .from('movies')
      .select('*')
      .eq('status', 'live')
      .eq('genre', genre)
      .neq('id', id)
      .limit(6)
    if (data) setSimilar(data)
  }

  useEffect(() => {
    async function checkWatchlist() {
      if (!user || !movie) return
      const { data } = await supabase.from('watchlist').select('id').eq('user_id', user.id).eq('movie_id', movie.id).maybeSingle()
      setInWatchlist(!!data)
    }
    checkWatchlist()
  }, [user, movie])

  const toggleWatchlist = async () => {
    if (!user) { setMsg('Duhet të hysh!'); setTimeout(() => setMsg(''), 2000); return }
    if (inWatchlist) {
      await supabase.from('watchlist').delete().eq('user_id', user.id).eq('movie_id', movie.id)
      setInWatchlist(false)
      setMsg('U hoq nga watchlist!')
    } else {
      await supabase.from('watchlist').insert({ user_id: user.id, movie_id: movie.id })
      setInWatchlist(true)
      setMsg('U shtua te watchlist! ✓')
    }
    setTimeout(() => setMsg(''), 2500)
  }

  const addToHistory = async () => {
    if (!user || !movie) return
    await supabase.from('watch_history').upsert(
      { user_id: user.id, movie_id: movie.id, watched_at: new Date().toISOString() },
      { onConflict: 'user_id,movie_id' }
    )
  }

  const handlePlay = () => {
    setShowIntro(true)
  }

  const handleIntroComplete = () => {
    setShowIntro(false)
    setPlaying(true)
    addToHistory()
  }

  const isEmbed = (url: string) =>
    url?.includes('iframe.mediadelivery.net') ||
    url?.includes('youtube.com/embed') ||
    url?.includes('player.mediadelivery.net')

  if (showIntro) return <CinealIntro onComplete={handleIntroComplete} />

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6b80' }}>
      Duke ngarkuar...
    </div>
  )

  if (!movie) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
        <div style={{ fontSize: '18px', marginBottom: '8px' }}>Filmi nuk u gjet</div>
        <Link href="/" style={{ color: '#e50914', textDecoration: 'none' }}>← Kthehu</Link>
      </div>
    </div>
  )

  const videoUrl = movie.video_url || movie.embed_url

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* Backdrop */}
      <div style={{ position: 'relative', height: 'clamp(200px, 40vh, 400px)', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${movie.backdrop_url || movie.poster_url})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.3)'
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a0f 0%, transparent 60%)' }} />
      </div>

      <div style={{ padding: '0 clamp(16px, 4vw, 60px) 60px', marginTop: 'clamp(-60px, -8vw, -100px)', position: 'relative', zIndex: 1 }}>

        {/* Info */}
        <div style={{ display: 'flex', gap: 'clamp(16px, 3vw, 28px)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {movie.poster_url && (
            <img src={movie.poster_url} alt={movie.title}
              style={{ width: 'clamp(100px, 15vw, 160px)', borderRadius: '8px', flexShrink: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }} />
          )}
          <div style={{ flex: 1, minWidth: '200px', paddingTop: 'clamp(20px, 5vw, 40px)' }}>
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 34px)', fontWeight: 700, marginBottom: '8px' }}>
              {movie.title_sq || movie.title}
            </h1>
            <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#b0b0c0', marginBottom: '12px', flexWrap: 'wrap' }}>
              {movie.year && <span>{movie.year}</span>}
              {movie.genre && <><span>•</span><span>{movie.genre}</span></>}
              {movie.rating && <><span>•</span><span>⭐ {movie.rating}</span></>}
              {movie.duration && <><span>•</span><span>{movie.duration}</span></>}
            </div>
            {movie.description && (
              <p style={{ fontSize: '14px', color: '#b0b0c0', lineHeight: 1.7, maxWidth: '580px', marginBottom: '20px' }}>
                {movie.description}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {videoUrl && (
                <button
                  onClick={handlePlay}
                  style={{
                    background: '#e50914', color: '#fff', border: 'none',
                    padding: '11px 26px', borderRadius: '6px', fontSize: '14px',
                    fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  ▶ Shiko Tani
                </button>
              )}
              <button onClick={toggleWatchlist}
                style={{ background: inWatchlist ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)', border: `1px solid ${inWatchlist ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.2)'}`, color: inWatchlist ? '#22c55e' : '#fff', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                {inWatchlist ? '✓ Në Watchlist' : '+ Watchlist'}
              </button>
              {msg && <span style={{ fontSize: '12px', color: '#22c55e' }}>{msg}</span>}
            </div>
          </div>
        </div>

        {/* Player */}
        {videoUrl && playing && (
          <div style={{ marginTop: '28px', borderRadius: '10px', overflow: 'hidden', background: '#000', width: '100%', maxWidth: '880px', aspectRatio: '16/9', position: 'relative' }}>
            {isEmbed(videoUrl) ? (
              <iframe
                src={videoUrl}
                style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', inset: 0 }}
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
              />
            ) : (
              <video controls style={{ width: '100%', height: '100%', display: 'block' }} src={videoUrl}>
                {movie.subtitle_url && <track kind="subtitles" src={movie.subtitle_url} srcLang="sq" label="Shqip" default />}
              </video>
            )}
          </div>
        )}

        <div style={{ marginTop: '20px', marginBottom: '40px' }}>
          <Link href="/" style={{ color: '#e50914', textDecoration: 'none', fontSize: '14px' }}>← Kthehu te kryefaqja</Link>
        </div>

        {/* Filma të Ngjashëm */}
        {similar.length > 0 && (
          <div>
            <h2 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600, marginBottom: '16px' }}>
              Filma të Ngjashëm — {movie.genre}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
              {similar.map((m: any) => (
                <Link key={m.id} href={`/film/${m.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ borderRadius: '8px', overflow: 'hidden', background: '#12121a', cursor: 'pointer' }}>
                    {m.poster_url ? (
                      <img src={m.poster_url} alt={m.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '2/3', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🎬</div>
                    )}
                    <div style={{ padding: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#6b6b80' }}>{m.year}</span>
                        {m.rating && <span style={{ fontSize: '11px', color: '#f5a623' }}>⭐ {m.rating}</span>}
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
