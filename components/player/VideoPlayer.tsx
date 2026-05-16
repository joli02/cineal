'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import { Movie } from '@/lib/supabase'

function isTVDevice(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent.toLowerCase()
  return (
    ua.includes('tv') || ua.includes('smarttv') ||
    ua.includes('googletv') || ua.includes('androidtv') ||
    ua.includes('hbbtv') || ua.includes('netcast') ||
    ua.includes('playstation') || ua.includes('ps4') || ua.includes('ps5') ||
    ua.includes('whale') || ua.includes('viera') || ua.includes('roku') ||
    (ua.includes('android') && !ua.includes('mobile') && !ua.includes('tablet'))
  )
}

export default function VideoPlayer({
  movie,
  onTimeUpdate,
  startTime = 0
}: {
  movie: Movie,
  onTimeUpdate?: (time: number) => void,
  startTime?: number
}) {
  const isTV = typeof window !== 'undefined' && isTVDevice()

  if (isTV && movie.embed_url) {
    // Hiq parametrat që nuk mbështeten nga TV/PlayStation
    const tvEmbedUrl = movie.embed_url.split('?')[0]

    return (
      <div style={{ background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ position: 'relative', paddingTop: '56.25%' }}>
          <iframe
            src={tvEmbedUrl}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
            allow="autoplay; fullscreen"
            title={movie.title}
          />
        </div>
      </div>
    )
  }

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeApplied = useRef(false)

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

  // Load HLS
  useEffect(() => {
    if (!started) return
    const video = videoRef.current
    if (!video || !movie.video_url) return

    if (movie.video_url.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(movie.video_url!)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (startTime > 0 && !startTimeApplied.current) {
            video.currentTime = startTime
            startTimeApplied.current = true
          }
          video.play().catch(() => {})
          setPlaying(true)
        })
        hls.on(Hls.Events.LEVEL_LOADED, (_e, data) => {
          if (data.details.totalduration) setDuration(data.details.totalduration)
        })
        return () => hls.destroy()
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = movie.video_url!
        video.addEventListener('loadedmetadata', () => {
          if (startTime > 0 && !startTimeApplied.current) {
            video.currentTime = startTime
            startTimeApplied.current = true
          }
          video.play().catch(() => {})
          setPlaying(true)
        }, { once: true })
      }
    } else {
      video.src = movie.video_url!
      video.addEventListener('loadedmetadata', () => {
        if (startTime > 0 && !startTimeApplied.current) {
          video.currentTime = startTime
          startTimeApplied.current = true
        }
        video.play().catch(() => {})
        setPlaying(true)
      }, { once: true })
    }
  }, [started, movie.video_url, startTime])

  // Subtitle
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const apply = () => {
      for (let i = 0; i < video.textTracks.length; i++) {
        video.textTracks[i].mode = subtitleLang === 'sq' && video.textTracks[i].language === 'sq' ? 'showing' : 'hidden'
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
      onTimeUpdate?.(video.currentTime)
      if (video.buffered.length > 0) setBuffered(video.buffered.end(video.buffered.length - 1))
    }
    const onDuration = () => {
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) setDuration(video.duration)
    }
    const onLoaded = () => {
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) setDuration(video.duration)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('durationchange', onDuration)
    video.addEventListener('loadedmetadata', onLoaded)
    video.addEventListener('canplay', onLoaded)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('durationchange', onDuration)
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('canplay', onLoaded)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [onTimeUpdate, started])

  // Fullscreen
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  // Auto-hide controls
  const showControls = useCallback(() => {
    setControlsVisible(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000)
  }, [])

  useEffect(() => {
    if (!playing) {
      setControlsVisible(true)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    } else {
      showControls()
    }
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current) }
  }, [playing, showControls])

  // Keyboard shortcuts
  useEffect(() => {
    if (!started) return
    const handleKey = (e: KeyboardEvent) => {
      const video = videoRef.current
      if (!video) return
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return
      switch (e.code) {
        case 'Space': e.preventDefault(); video.paused ? video.play() : video.pause(); showControls(); break
        case 'ArrowRight': e.preventDefault(); video.currentTime = Math.min(video.duration, video.currentTime + 10); showControls(); break
        case 'ArrowLeft': e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 10); showControls(); break
        case 'ArrowUp': e.preventDefault(); video.volume = Math.min(1, video.volume + 0.1); setVolume(video.volume); showControls(); break
        case 'ArrowDown': e.preventDefault(); video.volume = Math.max(0, video.volume - 0.1); setVolume(video.volume); showControls(); break
        case 'Escape': if (document.fullscreenElement) document.exitFullscreen(); break
        case 'KeyF': e.preventDefault(); document.fullscreenElement ? document.exitFullscreen() : containerRef.current?.requestFullscreen(); break
        case 'KeyM': e.preventDefault(); video.muted = !video.muted; setMuted(video.muted); showControls(); break
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [started, showControls])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    video.paused ? video.play() : video.pause()
  }

  const handleVideoClick = () => {
    if (!started) { setStarted(true); return }
    togglePlay(); showControls()
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    video.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }

  const toggleFullscreen = () => {
    document.fullscreenElement ? document.exitFullscreen() : containerRef.current?.requestFullscreen()
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted; setMuted(video.muted)
  }

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const v = parseFloat(e.target.value)
    video.volume = v; setVolume(v); setMuted(v === 0)
  }

  const skip = (sec: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + sec))
  }

  const formatTime = (s: number) => {
    if (!s || isNaN(s) || !isFinite(s)) return '0:00'
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60)
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}` : `${m}:${sec.toString().padStart(2, '0')}`
  }

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0
  const buffPct = duration > 0 ? (buffered / duration) * 100 : 0

  return (
    <div style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div
        ref={containerRef}
        style={{ position: 'relative', paddingTop: '56.25%', background: '#000', cursor: started && !controlsVisible ? 'none' : 'pointer' }}
        onMouseMove={() => started && showControls()}
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
            }}
            onClick={handleVideoClick}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
            <div style={{
              position: 'relative', zIndex: 2,
              width: '76px', height: '76px', borderRadius: '50%',
              background: 'rgba(229,9,20,0.92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid rgba(255,255,255,0.25)',
              boxShadow: '0 0 40px rgba(229,9,20,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(229,9,20,0.6)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(229,9,20,0.4)' }}
            >
              <div style={{ width: 0, height: 0, borderTop: '15px solid transparent', borderBottom: '15px solid transparent', borderLeft: '26px solid #fff', marginLeft: '5px' }} />
            </div>
          </div>
        )}

        {/* Video */}
        {started && (
          <video
            ref={videoRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            crossOrigin="anonymous"
            onClick={handleVideoClick}
          >
            {movie.subtitle_url && (
              <track kind="subtitles" src={movie.subtitle_url} srcLang="sq" label="Shqip" default={subtitleLang === 'sq'} />
            )}
          </video>
        )}

        {/* Controls */}
        {started && (
          <div
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              background: controlsVisible ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 40%, transparent 70%)' : 'transparent',
              opacity: controlsVisible ? 1 : 0,
              transition: 'opacity 0.4s ease',
              pointerEvents: controlsVisible ? 'auto' : 'none',
            }}
            onClick={e => { if (e.target === e.currentTarget) handleVideoClick() }}
          >
            <div style={{ padding: '0 16px 8px' }}>
              <div
                style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', cursor: 'pointer', position: 'relative', transition: 'height 0.15s' }}
                onClick={e => { e.stopPropagation(); seek(e) }}
                onMouseEnter={e => (e.currentTarget.style.height = '6px')}
                onMouseLeave={e => (e.currentTarget.style.height = '4px')}
              >
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${buffPct}%`, background: 'rgba(255,255,255,0.25)', borderRadius: '2px' }} />
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: '#e50914', borderRadius: '2px' }} />
                <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%,-50%)', width: '12px', height: '12px', background: '#fff', borderRadius: '50%' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px 14px', gap: '12px' }}
              onClick={e => e.stopPropagation()}>
              <button onClick={togglePlay} style={btn}>
                {playing
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                }
              </button>
              <button onClick={() => skip(-10)} style={btn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/><text x="9" y="14" fontSize="5" fill="white" fontWeight="bold">10</text></svg>
              </button>
              <button onClick={() => skip(10)} style={btn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/><text x="9" y="14" fontSize="5" fill="white" fontWeight="bold">10</text></svg>
              </button>
              <button onClick={toggleMute} style={btn}>
                {muted || volume === 0
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15" stroke="white" strokeWidth="2"/><line x1="17" y1="9" x2="23" y2="15" stroke="white" strokeWidth="2"/></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="white" strokeWidth="2" fill="none"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="white" strokeWidth="2" fill="none"/></svg>
                }
              </button>
              <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={changeVolume}
                style={{ width: '70px', accentColor: '#e50914', cursor: 'pointer' }} />
              <span style={{ color: '#fff', fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <div style={{ flex: 1 }} />
              {movie.subtitle_url && (
                <button onClick={() => setSubtitleLang(s => s === 'sq' ? 'none' : 'sq')}
                  style={{ ...btn, background: subtitleLang === 'sq' ? 'rgba(229,9,20,0.85)' : 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '4px 10px', fontSize: '12px', color: '#fff', fontWeight: 700 }}>
                  AL
                </button>
              )}
              <button onClick={toggleFullscreen} style={btn}>
                {isFullscreen
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                }
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '12px', color: '#6b6b80', background: '#0a0a0f' }}>
        {movie.subtitle_url && (
          <span style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)', color: '#f5a623', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 500 }}>
            Titra Shqip
          </span>
        )}
        <span>HD 1080p</span>
      </div>
    </div>
  )
}

const btn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: '4px', display: 'flex', alignItems: 'center',
  justifyContent: 'center', opacity: 0.9,
}
