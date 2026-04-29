'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function FilmPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [movie, setMovie] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [inWatchlist, setInWatchlist] = useState(false)
  const [watchlistMsg, setWatchlistMsg] = useState('')

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
      if (data) {
        await supabase.from('movies').update({ views: (data.views || 0) + 1 }).eq('id', data.id)
      }
    }
    if (slug) fetchMovie()
  }, [slug])

  useEffect(() => {
    async function checkWatchlist() {
      if (!user || !movie) return
      const { data } = await supabase.from('watchlist').select('id').eq('user_id', user.id).eq('movie_id', movie.id).single()
      setInWatchlist(!!data)
    }
    checkWatchlist()
  }, [user, movie])

  const toggleWatchlist = async () => {
    if (!user) { setWatchlistMsg('Duhet të hysh për të shtuar!'); setTimeout(() => setWatchlistMsg(''), 2000); return }
    if (inWatchlist) {
      await supabase.from('watchlist').delete().eq('user_id', user.id).eq('movie_id', movie.id)
      setInWatchlist(false)
      setWatchlistMsg('U hoq nga watchlist!')
    } else {
      await supabase.from('watchlist').insert({ user_id: user.id, movie_id: movie.id })
      setInWatchlist(true)
      setWatchlistMsg('U shtua te watchlist! ✓')
    }
    setTimeout(() => setWatchlistMsg(''), 2000)
  }

  const addToHistory = async () => {
    if (!user || !movie) return
    await supabase.from('watch_history').upsert({ user_id: user.id, movie_id: movie.id, watched_at: new Date().toISOString() }, { onConflict: 'user_id,movie_id' })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#6b6b80', fontSize: '16px' }}>Duke ngarkuar...</div>
    </div>
  )

  if (!movie) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
        <div style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>Filmi nuk u gjet</div>
        <Link href="/" style={{ color: '#e50914', textDecoration: 'none' }}>← Kthehu</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <div style={{ position: 'relative', height: '50vh', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${movie.backdrop_url || movie.poster_url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.3)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a0f 0%, transparent 60%)' }} />
      </div>

      <div style={{ padding: '0 60px 60px', marginTop: '-120px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          {movie.poster_url && (
            <img src={movie.poster_url} alt={movie.title} style={{ width: '180px', borderRadius: '8px', flexShrink: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
          )}
          <div style={{ flex: 1, paddingTop: '40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>{movie.title_sq || movie.title}</h1>
            <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#b0b0c0', marginBottom: '16px', flexWrap: 'wrap' }}>
              {movie.year && <span>{movie.year}</span>}
              {movie.genre && <><span>•</span><span>{movie.genre}</span></>}
              {movie.rating && <><span>•</span><span>⭐ {movie.rating}</span></>}
              {movie.duration && <><span>•</span><span>{movie.duration}</span></>}
            </div>
            {movie.description && (
              <p style={{ fontSize: '14px', color: '#b0b0c0', lineHeight: 1.7, maxWidth: '600px', marginBottom: '24px' }}>{movie.description}</p>
            )}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button onClick={toggleWatchlist} style={{ background: inWatchlist ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)', border: `1px solid ${inWatchlist ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.15)'}`, color: inWatchlist ? '#22c55e' : '#b0b0c0', padding: '10px 20px', borderRadius: '5px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                {inWatchlist ? '✓ Në Watchlist' : '+ Shto në Watchlist'}
              </button>
              {watchlistMsg && <span style={{ fontSize: '12px', color: '#22c55e' }}>{watchlistMsg}</span>}
            </div>
          </div>
        </div>

        {(movie.video_url || movie.embed_url) && (
          <div style={{ marginTop: '32px', borderRadius: '12px', overflow: 'hidden', background: '#000', maxWidth: '900px' }}>
            <video controls style={{ width: '100%', display: 'block' }} src={movie.video_url || movie.embed_url} crossOrigin="anonymous" onPlay={addToHistory}>
              {movie.subtitle_url && <track kind="subtitles" src={movie.subtitle_url} srcLang="sq" label="Shqip" default />}
            </video>
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <Link href="/" style={{ color: '#e50914', textDecoration: 'none', fontSize: '14px' }}>← Kthehu te kryefaqja</Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}