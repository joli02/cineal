'use client'
import { useState, useEffect } from 'react'

export default function CinealIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'spin-slow' | 'spin-fast' | 'logo' | 'letters' | 'fadeout'>('spin-slow')
  const [visibleLetters, setVisibleLetters] = useState(0)

  const letters = ['C', 'I', 'N', 'E', 'A', 'L']

  useEffect(() => {
    // Faza 1: rotation e ngadaltë — 1 sekondë
    const t1 = setTimeout(() => setPhase('spin-fast'), 1000)
    // Faza 2: rotation e shpejtë — 0.8 sekondë
    const t2 = setTimeout(() => setPhase('logo'), 1800)
    // Faza 3: logo shfaqet — 0.5 sekondë
    const t3 = setTimeout(() => setPhase('letters'), 2300)
    // Faza 4: shkronjat dalin një nga një
    const t4 = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        i++
        setVisibleLetters(i)
        if (i >= letters.length) clearInterval(interval)
      }, 100)
    }, 2300)
    // Faza 5: fade out
    const t5 = setTimeout(() => setPhase('fadeout'), 3500)
    // Faza 6: kompleton
    const t6 = setTimeout(() => onComplete(), 4000)

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      clearTimeout(t4); clearTimeout(t5); clearTimeout(t6)
    }
  }, [])

  const spinDuration = phase === 'spin-slow' ? '1s' : phase === 'spin-fast' ? '0.15s' : '0s'

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, flexDirection: 'column',
      opacity: phase === 'fadeout' ? 0 : 1,
      transition: phase === 'fadeout' ? 'opacity 0.5s ease' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

        {/* Logo me rotation */}
        <div style={{
          width: '64px', height: '64px',
          animation: phase === 'spin-slow' || phase === 'spin-fast'
            ? `spin ${spinDuration} linear infinite`
            : 'none',
          opacity: 1,
          transition: 'all 0.3s',
          filter: 'drop-shadow(0 0 20px #e50914)',
        }}>
          <img
            src="/logo.svg"
            alt="C"
            style={{
              width: '100%', height: '100%',
              objectFit: 'contain',
              filter: phase === 'logo' || phase === 'letters' || phase === 'fadeout'
                ? 'brightness(1) drop-shadow(0 0 30px #e50914)'
                : 'brightness(0.8)',
              transform: phase === 'logo' ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.3s ease, filter 0.3s ease',
            }}
          />
        </div>

        {/* Shkronjat dalin një nga një */}
        {(phase === 'letters' || phase === 'fadeout') && (
          <div style={{ display: 'flex', gap: '2px' }}>
            {letters.map((letter, i) => (
              <span key={i} style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '52px',
                letterSpacing: '4px',
                color: i === 0 ? '#e50914' : '#fff',
                textShadow: '0 0 20px rgba(229,9,20,0.5)',
                opacity: i < visibleLetters ? 1 : 0,
                transform: i < visibleLetters ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.15s ease, transform 0.15s ease',
                display: 'inline-block',
              }}>
                {letter}
              </span>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}