'use client'
import { useState } from 'react'
import { Movie } from '@/lib/supabase'

export default function VideoPlayer({ movie }: { movie: Movie }) {
  const [playing, setPlaying] = useState(false)
  const [subtitleLang, setSubtitleLang] = useState<'sq' | 'en' | 'none'>('sq')

  // Build embed URL with subtitle param if Bunny.net
  const buildEmbedUrl = () => {
    let url = movie.embed_url
    if (!url) return ''
    // Add subtitle track to Bunny.net player
    if (url.includes('mediadelivery.net') && movie.subtitle_url && subtitleLang === 'sq') {
      url += (url.includes('?') ? '&' : '?') + `captions=true`
    }
    return url
  }

  return (
    <div style={{
      background: '#12121a',
      borderRadius: '10px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Player */}
      <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
        {!playing ? (
          // Poster with play button
          <div
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${movie.backdrop_url || movie.poster_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setPlaying(true)}
          >
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              position: 'absolute', inset: 0,
            }} />
            <div style={{
              position: 'relative', zIndex: 2,
              width: '72px', height: '72px',
              background: 'rgba(229,9,20,0.9)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid rgba(255,255,255,0.2)',
              transition: 'transform 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{
                width: 0, height: 0,
                borderTop: '14px solid transparent',
                borderBottom: '14px solid transparent',
                borderLeft: '24px solid #fff',
                marginLeft: '4px',
              }} />
            </div>
          </div>
        ) : (
          // Actual iframe embed
          <iframe
            src={buildEmbedUrl()}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              border: 'none',
            }}
            allowFullScreen
            allow="autoplay; fullscreen"
            title={movie.title}
          />
        )}
      </div>

      {/* Subtitle bar */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#b0b0c0' }}>
          <span>Titra:</span>
          {movie.subtitle_url && (
            <span style={{
              background: 'rgba(245,166,35,0.12)',
              border: '1px solid rgba(245,166,35,0.3)',
              color: '#f5a623',
              fontSize: '11px',
              padding: '3px 10px',
              borderRadius: '20px',
              fontWeight: 500,
            }}>✓ Shqip</span>
          )}
          <span style={{ fontSize: '12px', color: '#6b6b80' }}>— HD 1080p</span>
        </div>

        <select
          value={subtitleLang}
          onChange={e => setSubtitleLang(e.target.value as 'sq' | 'en' | 'none')}
          style={{
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#b0b0c0',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="sq">🇦🇱 Shqip</option>
          <option value="en">🇬🇧 English</option>
          <option value="none">Pa Titra</option>
        </select>
      </div>
    </div>
  )
}
