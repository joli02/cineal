'use client'
import { useState, useEffect, useRef } from 'react'

export default function CinealIntro({ onComplete }: { onComplete: () => void }) {
  const [rotation, setRotation] = useState(0)
  const [phase, setPhase] = useState<'fast'|'slow'|'morph'|'letters'|'out'>('fast')
  const [visibleLetters, setVisibleLetters] = useState(0)
  const frameRef = useRef<number>()
  const speedRef = useRef(30)
  const angleRef = useRef(0)
  const letters = ['C','I','N','E','A','L']

  useEffect(() => {
    // Fast spin
    const fastSpin = () => {
      angleRef.current += 30
      setRotation(angleRef.current)
      frameRef.current = requestAnimationFrame(fastSpin)
    }
    frameRef.current = requestAnimationFrame(fastSpin)

    // After 1s start slowing
    const t1 = setTimeout(() => {
      cancelAnimationFrame(frameRef.current!)
      setPhase('slow')
      speedRef.current = 25
      const slowSpin = () => {
        speedRef.current *= 0.90
        if (speedRef.current < 0.15) {
          cancelAnimationFrame(frameRef.current!)
          setPhase('morph')
          return
        }
        angleRef.current += speedRef.current
        setRotation(angleRef.current)
        frameRef.current = requestAnimationFrame(slowSpin)
      }
      frameRef.current = requestAnimationFrame(slowSpin)
    }, 1000)

    return () => {
      clearTimeout(t1)
      cancelAnimationFrame(frameRef.current!)
    }
  }, [])

  useEffect(() => {
    if (phase === 'morph') {
      const t = setTimeout(() => setPhase('letters'), 700)
      return () => clearTimeout(t)
    }
    if (phase === 'letters') {
      let i = 0
      const iv = setInterval(() => {
        i++
        setVisibleLetters(i)
        if (i >= letters.length) {
          clearInterval(iv)
          setTimeout(() => setPhase('out'), 900)
          setTimeout(() => onComplete(), 1600)
        }
      }, 110)
      return () => clearInterval(iv)
    }
  }, [phase])

  const ringOpacity = phase === 'fast' || phase === 'slow' ? 1 : 0
  const logoOpacity = phase === 'morph' || phase === 'letters' || phase === 'out' ? 1 : 0
  const ringScale = phase === 'morph' ? 1.3 : 1

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      opacity: phase === 'out' ? 0 : 1,
      transition: 'opacity 0.7s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

        {/* Kontejner i logos dhe rrethit */}
        <div style={{ position: 'relative', width: '72px', height: '72px' }}>

          {/* Rrethi rrotullues */}
          <svg width="72" height="72" viewBox="0 0 72 72"
            style={{
              position: 'absolute', inset: 0,
              transform: `rotate(${rotation}deg) scale(${ringScale})`,
              opacity: ringOpacity,
              transition: phase === 'morph'
                ? 'opacity 0.5s ease, transform 0.5s ease'
                : 'none',
            }}>
            {/* Rrethi i jashtëm */}
            <circle cx="36" cy="36" r="30"
              fill="none" stroke="#e50914" strokeWidth="4"
              strokeDasharray="100 88" strokeLinecap="round" />
            {/* Rrethi i brendshëm */}
            <circle cx="36" cy="36" r="20"
              fill="none" stroke="#c00" strokeWidth="3"
              strokeDasharray="60 66" strokeLinecap="round"
              strokeDashoffset="30" />
          </svg>

          {/* Logo — fade in kur rrethi zbehet */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: logoOpacity,
            transform: logoOpacity === 1 ? 'scale(1)' : 'scale(0.6)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}>
            <img src="/logo.svg" alt="Cineal"
              style={{
                width: '68px', height: '68px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 16px rgba(229,9,20,1))',
              }} />
          </div>
        </div>

        {/* Shkronjat */}
        {(phase === 'letters' || phase === 'out') && (
          <div style={{ display: 'flex' }}>
            {letters.map((l, i) => (
              <span key={i} style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '54px',
                lineHeight: 1,
                color: i === 0 ? '#e50914' : '#fff',
                textShadow: '0 0 20px rgba(229,9,20,0.5)',
                opacity: i < visibleLetters ? 1 : 0,
                transform: i < visibleLetters ? 'translateY(0)' : 'translateY(15px)',
                transition: 'all 0.12s ease',
                display: 'inline-block',
                letterSpacing: '3px',
              }}>{l}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}