'use client'
import { useState, useEffect, useRef } from 'react'

export default function CinealIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'loading' | 'logo' | 'zoom'>('loading')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Krijo audio element
    const audio = new Audio('/cineal_audio.mp3')
    audio.volume = 0.85
    audioRef.current = audio

    // 1. Loading spinner për 1.2s
    const t1 = setTimeout(() => setPhase('logo'), 1200)

    // 2. Logo shfaqet e vogël — luan audio
    const t2 = setTimeout(() => {
      setPhase('zoom')
      audio.play().catch(() => {}) // catch nëse browser bllokon autoplay
    }, 1700)

    // 3. onComplete
    const t3 = setTimeout(() => onComplete(), 2600)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      audio.pause()
      audio.src = ''
    }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      {/* Loading spinner */}
      {phase === 'loading' && (
        <div style={{
          width: '48px', height: '48px',
          border: '3px solid rgba(229,9,20,0.2)',
          borderTop: '3px solid #e50914',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      )}

      {/* Logo */}
      {(phase === 'logo' || phase === 'zoom') && (
        <img
          src="/logo.svg"
          alt=""
          style={{
            width: phase === 'zoom' ? '520px' : '72px',
            height: phase === 'zoom' ? '520px' : '72px',
            opacity: phase === 'zoom' ? 0 : 1,
            objectFit: 'contain',
            transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1), height 0.9s cubic-bezier(0.4,0,0.2,1), opacity 0.9s ease',
          }}
        />
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
