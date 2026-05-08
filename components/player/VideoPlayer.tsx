'use client'
import { useEffect, useRef, useState } from 'react'
import { Movie } from '@/lib/supabase'

export default function VideoPlayer({ movie }: { movie: Movie }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const trackRef = useRef<HTMLTrackElement>(null)
  const [playing, setPlaying] = useState(false)
  const [subtitleLang, setSubtitleLang] = useState<'sq' | 'en' | 'none'>('sq')
  const [hlsLoaded, setHlsLoaded] = useState(false)

  // Load hls.js and attach to video
  useEffect(() => {
    if (!playing) return
    const video = videoRef.current
    if (!video || !movie.video_url) return

    const isHls = movie.video_url.includes('.m3u8')

    if (isHls) {
      // Dynamically load hls.js
      import('hls.js').then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls()
          hls.loadSource(movie.video_url!)
          hls.attachMedia(video)
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play()
            setHlsLoaded(true)
          })
          // Cleanup
          return () => hls.destroy()
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari native HLS
          video.src = movie.video_url!
          video.play()
          setHlsLoaded(true)
        }
      })
    } else {
      video.src = movie.video_url!
      video.play()
      setHlsLoaded(true)
    }
  }, [playing, movie.video_url])

  // Handle subtitle track changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Wait for video element to be ready
    const applySubtitles = () => {
      const tracks = video.textTracks
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = 'hidden'
      }

      if (subtitleLang === 'none') return

      // Find and enable correct track
      for (let i = 0; i < tracks.length; i++) {
        if (subtitleLang === 'sq' && tracks[i].language === 'sq') {
          tracks[i].mode = 'showing'
          break
        }
        if (subtitleLang === 'en' && tracks[i].language === 'en') {
          tracks[i].mode = 'showing'
          break
        }
      }
    }

    applySubtitles()
    video.addEventListener('loadedmetadata', applySubtitles)
    return () => video.removeEventListener('loadedmetadata', applySubtitles)
  }, [subtitleLang, hlsLoaded])

  return (
    <div style={{
      background: '#12121a',
      borderRadius: '10px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Player */}
      <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>

        {/* Poster / Play button */}
        {!playing && (
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
            <div style={{ background: 'rgba(0,0,0,0.4)', position: 'absolute', inset: 0 }} />
            <div
              style={{
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
        )}

        {/* Video element with subtitle tracks */}
        {playing && (
          <video
            ref={videoRef}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
            }}
            controls
            crossOrigin="anonymous"
          >
            {/* Shqip subtitles from Bunny Storage */}
            {movie.subtitle_url && (
              <track
                ref={trackRef}
                kind="subtitles"
                src={movie.subtitle_url}
                srcLang="sq"
                label="Shqip"
                default={subtitleLang === 'sq'}
              />
            )}
          </video>
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
