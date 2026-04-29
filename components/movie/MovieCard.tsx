'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function MovieCard({ movie }: { movie: any }) {
  const [inWatchlist, setInWatchlist] = useState(false)
  const [inFavorites, setInFavorites] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        checkWatchlist(session.user.id)
        checkFavorites(session.user.id)
      }
    })
  }, [])

  async function checkWatchlist(userId: string) {
    const { data } = await supabase.from('watchlist').select('id').eq('user_id', userId).eq('movie_id', movie.id).maybeSingle()
    setInWatchlist(!!data)
  }

  async function checkFavorites(userId: string) {
    const { data } = await supabase.from('favorites').select('id').eq('user_id', userId).eq('movie_id', movie.id).maybeSingle()
    setInFavorites(!!data)
  }

  const toggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) return
    if (inWatchlist) {
      await supabase.from('watchlist').delete().eq('user_id', user.id).eq('movie_id', movie.id)
      setInWatchlist(false)
    } else {
      await supabase.from('watchlist').insert({ user_id: user.id, movie_id: movie.id })
      setInWatchlist(true)
    }
  }

  const toggleFavorites = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!user) return
    if (inFavorites) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('movie_id', movie.id)
      setInFavorites(false)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, movie_id: movie.id })
      setInFavorites(true)
    }
  }

  return (
    <Link href={`/film/${movie.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#12121a', cursor: 'pointer' }}>
        <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
          <img src={movie.poster_url} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

          {movie.subtitle_url && (
            <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#e50914', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', letterSpacing: '1px' }}>SQ</span>
          )}

          <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.75)', color: '#f5a623', fontSize: '11px', fontWeight: 500, padding: '3px 7px', borderRadius: '3px' }}>★ {movie.rating}</span>

          {user && (
            <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button onClick={toggleFavorites}
                title={inFavorites ? 'Hiq nga të preferuarat' : 'Shto te të preferuarat'}
                style={{ width: '30px', height: '30px', borderRadius: '50%', background: inFavorites ? 'rgba(229,9,20,0.9)' : 'rgba(0,0,0,0.7)', border: `1px solid ${inFavorites ? '#e50914' : 'rgba(255,255,255,0.3)'}`, color: '#fff', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {inFavorites ? '❤️' : '🤍'}
              </button>
              <button onClick={toggleWatchlist}
                title={inWatchlist ? 'Hiq nga watchlist' : 'Shto te watchlist'}
                style={{ width: '30px', height: '30px', borderRadius: '50%', background: inWatchlist ? 'rgba(34,197,94,0.9)' : 'rgba(0,0,0,0.7)', border: `1px solid ${inWatchlist ? '#22c55e' : 'rgba(255,255,255,0.3)'}`, color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {inWatchlist ? '✓' : '+'}
              </button>
            </div>
          )}

          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)', opacity: 0, transition: 'opacity 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
            <div style={{ width: '44px', height: '44px', background: 'rgba(229,9,20,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '14px solid #fff', marginLeft: '3px' }} />
            </div>
          </div>
        </div>

        <div style={{ padding: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: '#b0b0c0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', color: '#6b6b80' }}>{movie.year}</span>
            <span style={{ fontSize: '10px', color: '#6b6b80', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '3px' }}>{movie.genre}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function TrendingCard({ movie, index }: { movie: any, index: number }) {
  return (
    <Link href={`/film/${movie.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '16/9', cursor: 'pointer', background: '#12121a' }}>
        <img src={movie.backdrop_url || movie.poster_url} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 50%)' }} />
        <div style={{ position: 'absolute', top: '8px', left: '8px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', color: 'rgba(255,255,255,0.15)' }}>0{index + 1}</div>
        <div style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '11px', fontWeight: 500, color: '#fff' }}>{movie.title}</div>
      </div>
    </Link>
  )
}