'use client'
import { useState, useEffect, useRef } from 'react'

export default function CinealIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'spin' | 'morph' | 'letters' | 'out'>('spin')
  const [rotation, setRotation] = useState(0)
  const [visibleLetters, setVisibleLetters] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const frameRef = useRef<number>()
  const speedRef = useRef(25)
  const angleRef = useRef(0)

  const letters = ['C', 'I', 'N', 'E', 'A', 'L']

  useEffect(() => {
    // Spin i shpejtë për 1.2 sekonda pastaj ngadalësohet
    const slowDown = setTimeout(() => {
      speedRef.current = 25
      const decelerate = () => {
        speedRef.current *= 0.91
        if (speedRef.current < 0.2) {
          cancelAnimationFrame(frameRef.current!)
          setPhase('morph')
          return
        }
        angleRef.current += speedRef.current
        setRotation(angleRef.current)
        frameRef.current = requestAnimationFrame(decelerate)
      }
      frameRef.current = requestAnimationFrame(decelerate)
    }, 1200)

    // Spin i shpejtë
    const fastSpin = () => {
      angleRef.current += speedRef.current
      setRotation(angleRef.current)
      frameRef.current = requestAnimationFrame(fastSpin)
    }
    frameRef.current = requestAnimationFrame(fastSpin)

    return () => {
      clearTimeout(slowDown)
      cancelAnimationFrame(frameRef.current!)
    }
  }, [])

  useEffect(() => {
    if (phase === 'morph') {
      // Pas 0.8 sekondash morph → letters
      setTimeout(() => setPhase('letters'), 800)
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'letters') {
      let i = 0
      const interval = setInterval(() => {
        i++
        setVisibleLetters(i)
        if (i >= letters.length) {
          clearInterval(interval)
          setTimeout(() => {
            setPhase('out')
            setOpacity(0)
            setTimeout(() => onComplete(), 700)
          }, 900)
        }
      }, 110)
      return () => clearInterval(interval)
    }
  }, [phase])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, opacity,
      transition: 'opacity 0.7s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

        {/* Ikona — rrotullohet pastaj bëhet logo */}
        <div style={{
          width: '72px', height: '72px',
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Rrethi spinner */}
          <svg
            width="72" height="72"
            viewBox="0 0 72 72"
            style={{
              position: 'absolute', inset: 0,
              transform: `rotate(${rotation}deg)`,
              opacity: phase === 'spin' || phase === 'morph' ? 1 : 0,
              transition: phase === 'morph' ? 'opacity 0.6s ease' : 'none',
            }}
          >
            <circle cx="36" cy="36" r="30"
              fill="none"
              stroke="#e50914"
              strokeWidth="4"
              strokeDasharray="120 70"
              strokeLinecap="round"
            />
            <circle cx="36" cy="36" r="22"
              fill="none"
              stroke="#c00"
              strokeWidth="2"
              strokeDasharray="80 60"
              strokeLinecap="round"
              strokeDashoffset="40"
            />
          </svg>

          {/* Logo shfaqet pas morphit */}
          <img
            src="/logo.svg"
            alt="Cineal"
            style={{
              width: '64px', height: '64px',
              objectFit: 'contain',
              position: 'absolute',
              opacity: phase === 'morph' || phase === 'letters' || phase === 'out' ? 1 : 0,
              transform: phase === 'morph' || phase === 'letters' || phase === 'out'
                ? 'scale(1) rotate(0deg)'
                : 'scale(0.3) rotate(180deg)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
              filter: 'drop-shadow(0 0 16px rgba(229,9,20,0.9))',
            }}
          />
        </div>

        {/* Shkronjat */}
        {(phase === 'letters' || phase === 'out') && (
          <div style={{ display: 'flex' }}>
            {letters.map((letter, i) => (
              <span key={i} style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '54px',
                letterSpacing: '2px',
                lineHeight: 1,
                color: i === 0 ? '#e50914' : '#fff',
                textShadow: '0 0 24px rgba(229,9,20,0.5)',
                opacity: i < visibleLetters ? 1 : 0,
                transform: i < visibleLetters ? 'translateX(0)' : 'translateX(-15px)',
                transition: 'all 0.12s ease',
                display: 'inline-block',
              }}>
                {letter}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}