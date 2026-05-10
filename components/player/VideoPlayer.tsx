'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import { Movie } from '@/lib/supabase'

// Convert SRT content to VTT blob URL
function srtToVttUrl(srtText: string): string {
  const vtt = 'WEBVTT\n\n' + srtText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/^\uFEFF/, '') // Remove BOM
    .replace(/^[\d]+\n(\d{2}:\d{2}:\d{2}),(\d{3})/gm, '$1.$2')
    .replace(/(\d{2}:\d{2}:\d{2}),(\d{3}) --> (\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2 --> $3.$4')
  const blob = new Blob([vtt], { type: 'text/vtt' })
  return URL.createObjectURL(blob)
}

// Fetch subtitle file and convert if SRT
async function loadSubtitleUrl(url: string): Promise<string> {
  if (!url) return ''
  if (!url.endsWith('.srt')) return url
  try {
    const res = await fetch(url)
    const text = await res.text()
    return srtToVttUrl(text)
  } catch {
    return url
  }
}


// Detect Android TV / Smart TV browsers
function isTVDevice(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes('tv') || ua.includes('smarttv') || ua.includes('googletv') ||
    ua.includes('androidtv') || ua.includes('hbbtv') || ua.includes('netcast') ||
    (ua.includes('android') && !ua.includes('mobile') && !ua.includes('tablet'))
}

export default function VideoPlayer({ movie }: { movie: Movie }) {
  const isTV = typeof window !== 'undefined' && isTVDevice()

  // For TV devices use Bunny embed iframe directly
  if (isTV && movie.embed_url) {
    return (
      <div style={{ background: '#0a0a0f', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
          <iframe
            src={movie.embed_url}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
            allow="autoplay; fullscreen"
            title={movie.title}
          />
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', color: '#6b6b80' }}>
          <span>HD 1080p</span>
        </div>
      </div>
    )
  }
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [subtitleLang, setSubtitleLang] = useState<'sq' | 'none'>('sq')
  const [buffered, setBuffered] = useState(0)
  const [subtitleBlobUrl, setSubtitleBlobUrl] = useState<string>('')

  // Load subtitle URL (convert SRT to VTT if needed)
  useEffect(() => {
    if (!started || !movie.subtitle_url) return
    loadSubtitleUrl(movie.subtitle_url).then(url => setSubtitleBlobUrl(url))
    return () => {
      if (subtitleBlobUrl.startsWith('blob:')) URL.revokeObjectURL(subtitleBlobUrl)
    }
  }, [started, movie.subtitle_url])

  // Load hls.js
  useEffect(() => {
    if (!started) return
    const video = videoRef.current
    if (!video || !movie.video_url) return

    const isHls = movie.video_url.includes('.m3u8')
    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(movie.video_url!)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play()
          setPlaying(true)
        })
        return () => hls.destroy()
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = movie.video_url!
        video.play()
        setPlaying(true)
      }
    } else {
      video.src = movie.video_url!
      video.play()
      setPlaying(true)
    }
  }, [started, movie.video_url])

  // Subtitle track
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const apply = () => {
      for (let i = 0; i < video.textTracks.length; i++) {
        video.textTracks[i].mode =
          subtitleLang === 'sq' && video.textTracks[i].language === 'sq'
            ? 'showing'
            : 'hidden'
      }
    }
    apply()
    video.addEventListener('loadedmetadata', apply)
    return () => video.removeEventListener('loadedmetadata', apply)
  }, [subtitleLang, started])

  // Video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onTime = () => {
      setCurrentTime(video.currentTime)
      if (video.buffered.length > 0)
        setBuffered(video.buffered.end(video.buffered.length - 1))
    }
    const onDuration = () => setDuration(video.duration)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('durationchange', onDuration)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('durationchange', onDuration)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [started])

  // Fullscreen change
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  // Auto-hide controls
  const showControls = useCallback(() => {
    setControlsVisible(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      if (playing) setControlsVisible(false)
    }, 3000)
  }, [playing])

  useEffect(() => {
    if (!playing) {
      setControlsVisible(true)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    } else {
      showControls()
    }
  }, [playing, showControls])

  // Actions
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play()
    else video.pause()
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    video.currentTime = pct * duration
  }

  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) el.requestFullscreen()
    else document.exitFullscreen()
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const v = parseFloat(e.target.value)
    video.volume = v
    setVolume(v)
    setMuted(v === 0)
  }

  const skip = (sec: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + sec))
  }

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const pct = duration ? (currentTime / duration) * 100 : 0
  const buffPct = duration ? (buffered / duration) * 100 : 0

  return (
    <div style={{
      background: '#0a0a0f',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          paddingTop: '56.25%',
          background: '#000',
          cursor: started && !controlsVisible ? 'none' : 'default',
        }}
        onMouseMove={started ? showControls : undefined}
        onMouseLeave={() => playing && setControlsVisible(false)}
      >
        {/* Poster */}
        {!started && (
          <div
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${movie.backdrop_url || movie.poster_url})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setStarted(true)}
          >
            <div style={{ background: 'rgba(0,0,0,0.5)', position: 'absolute', inset: 0 }} />
            <div
              style={{
                position: 'relative', zIndex: 2,
                width: '76px', height: '76px',
                background: 'rgba(229,9,20,0.92)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid rgba(255,255,255,0.25)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 0 40px rgba(229,9,20,0.4)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.boxShadow = '0 0 60px rgba(229,9,20,0.6)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 0 40px rgba(229,9,20,0.4)'
              }}
            >
              <div style={{
                width: 0, height: 0,
                borderTop: '15px solid transparent',
                borderBottom: '15px solid transparent',
                borderLeft: '26px solid #fff',
                marginLeft: '5px',
              }} />
            </div>
          </div>
        )}

        {/* Video */}
        {started && (
          <video
            ref={videoRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            crossOrigin="anonymous"
            onClick={togglePlay}
          >
            {movie.subtitle_url && (
              <track
                kind="subtitles"
                src={subtitleBlobUrl || movie.subtitle_url}
                srcLang="sq"
                label="Shqip"
                default={subtitleLang === 'sq'}
              />
            )}
          </video>
        )}

        {/* Controls overlay */}
        {started && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            background: controlsVisible
              ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 40%, transparent 70%)'
              : 'transparent',
            opacity: controlsVisible ? 1 : 0,
            transition: 'opacity 0.35s ease',
            pointerEvents: controlsVisible ? 'auto' : 'none',
          }}>
            {/* Progress bar */}
            <div style={{ padding: '0 16px 8px' }}>
              <div
                style={{
                  height: '4px', background: 'rgba(255,255,255,0.2)',
                  borderRadius: '2px', cursor: 'pointer', position: 'relative',
                  transition: 'height 0.15s',
                }}
                onClick={seek}
                onMouseEnter={e => (e.currentTarget.style.height = '6px')}
                onMouseLeave={e => (e.currentTarget.style.height = '4px')}
              >
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${buffPct}%`, background: 'rgba(255,255,255,0.25)', borderRadius: '2px',
                }} />
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${pct}%`, background: '#e50914', borderRadius: '2px',
                }} />
                <div style={{
                  position: 'absolute', top: '50%', left: `${pct}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '12px', height: '12px',
                  background: '#fff', borderRadius: '50%',
                }} />
              </div>
            </div>

            {/* Bottom controls */}
            <div style={{
              display: 'flex', alignItems: 'center',
              padding: '0 16px 14px', gap: '12px',
            }}>
              {/* Play/Pause */}
              <button onClick={togglePlay} style={btnStyle}>
                {playing ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                )}
              </button>

              {/* Skip -10 */}
              <button onClick={() => skip(-10)} style={btnStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                  <text x="9" y="14" fontSize="5" fill="white" fontWeight="bold">10</text>
                </svg>
              </button>

              {/* Skip +10 */}
              <button onClick={() => skip(10)} style={btnStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                  <text x="9" y="14" fontSize="5" fill="white" fontWeight="bold">10</text>
                </svg>
              </button>

              {/* Volume */}
              <button onClick={toggleMute} style={btnStyle}>
                {muted || volume === 0 ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                    <line x1="23" y1="9" x2="17" y2="15" stroke="white" strokeWidth="2"/>
                    <line x1="17" y1="9" x2="23" y2="15" stroke="white" strokeWidth="2"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="white" strokeWidth="2" fill="none"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="white" strokeWidth="2" fill="none"/>
                  </svg>
                )}
              </button>
              <input
                type="range" min="0" max="1" step="0.05"
                value={muted ? 0 : volume}
                onChange={changeVolume}
                style={{ width: '70px', accentColor: '#e50914', cursor: 'pointer' }}
              />

              {/* Time */}
              <span style={{ color: '#fff', fontSize: '13px', fontFamily: 'monospace' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div style={{ flex: 1 }} />

              {/* Subtitles */}
              {movie.subtitle_url && (
                <button
                  onClick={() => setSubtitleLang(s => s === 'sq' ? 'none' : 'sq')}
                  style={{
                    ...btnStyle,
                    background: subtitleLang === 'sq' ? 'rgba(229,9,20,0.85)' : 'rgba(255,255,255,0.15)',
                    borderRadius: '4px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    color: '#fff',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                  }}
                >
                  AL
                </button>
              )}

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} style={btnStyle}>
                {isFullscreen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info bar */}
      <div style={{
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: '10px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontSize: '12px', color: '#6b6b80',
      }}>
        {movie.subtitle_url && (
          <span style={{
            background: 'rgba(245,166,35,0.12)',
            border: '1px solid rgba(245,166,35,0.3)',
            color: '#f5a623', fontSize: '11px',
            padding: '3px 10px', borderRadius: '20px', fontWeight: 500,
          }}>✓ Titra Shqip</span>
        )}
        <span>HD 1080p</span>
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: '4px', display: 'flex', alignItems: 'center',
  justifyContent: 'center', opacity: 0.9, transition: 'opacity 0.15s',
}
