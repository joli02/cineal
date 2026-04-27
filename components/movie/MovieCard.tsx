'use client'
import Link from 'next/link'
import { Movie } from '@/lib/supabase'

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/film/${movie.slug}`} style={{ textDecoration: 'none' }}>
      <div className="movie-card" style={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#12121a',
        cursor: 'pointer',
      }}>
        {/* Poster */}
        <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden' }}>
          <img
            src={movie.poster_url}
            alt={movie.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />

          {/* SQ Badge */}
          {movie.subtitle_url && (
            <span className="sq-badge" style={{
              position: 'absolute', top: '8px', left: '8px',
            }}>SQ</span>
          )}

          {/* Rating */}
          <span style={{
            position: 'absolute', top: '8px', right: '8px',
            background: 'rgba(0,0,0,0.75)',
            color: '#f5a623',
            fontSize: '11px',
            fontWeight: 500,
            padding: '3px 7px',
            borderRadius: '3px',
          }}>★ {movie.rating}</span>

          {/* Hover overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
            opacity: 0,
            transition: 'opacity 0.3s',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '12px',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
          >
            {/* Play button */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '44px', height: '44px',
              background: 'rgba(229,9,20,0.9)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 0, height: 0,
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderLeft: '14px solid #fff',
                marginLeft: '3px',
              }} />
            </div>
            <div style={{ fontSize: '11px', fontWeight: 500, color: '#fff' }}>{movie.title}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{movie.year}</div>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '10px' }}>
          <div style={{
            fontSize: '12px', fontWeight: 500, color: '#b0b0c0',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{movie.title}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', color: '#6b6b80' }}>{movie.year}</span>
            <span style={{
              fontSize: '10px', color: '#6b6b80',
              background: 'rgba(255,255,255,0.05)',
              padding: '2px 6px', borderRadius: '3px',
            }}>{movie.genre}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Wide card for trending section
export function TrendingCard({ movie, index }: { movie: Movie, index: number }) {
  return (
    <Link href={`/film/${movie.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        aspectRatio: '16/9',
        cursor: 'pointer',
        background: '#12121a',
      }}>
        <img
          src={movie.backdrop_url || movie.poster_url}
          alt={movie.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 50%)',
        }} />
        <div style={{
          position: 'absolute', top: '8px', left: '8px',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '22px',
          color: 'rgba(255,255,255,0.15)',
        }}>0{index + 1}</div>
        <div style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '11px', fontWeight: 500, color: '#fff' }}>
          {movie.title}
        </div>
      </div>
    </Link>
  )
}
