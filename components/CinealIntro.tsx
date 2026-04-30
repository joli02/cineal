'use client'
import { useState, useEffect, useRef } from 'react'

export default function CinealIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'spinning' | 'slowing' | 'logo' | 'letters' | 'done'>('spinning')
  const [rotation, setRotation] = useState(0)
  const [visibleLetters, setVisibleLetters] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const frameRef = useRef<number>()
  const speedRef = useRef(20)
  const angleRef = useRef(0)

  const letters = ['C', 'I', 'N', 'E', 'A', 'L']

  useEffect(() => {
    // Faza 1: spin i shpejtë për 1 sekondë
    const slowStart = setTimeout(() => {
      setPhase('slowing')
    }, 1000)

    return () => clearTimeout(slowStart)
  }, [])

  useEffect(() => {
    if (phase === 'spinning') {
      const animate = () => {
        angleRef.current += 20
        setRotation(angleRef.current)
        frameRef.current = requestAnimationFrame(animate)
      }
      frameRef.current = requestAnimationFrame(animate)
    }

    if (phase === 'slowing') {
      const animate = () => {
        speedRef.current *= 0.93
        if (speedRef.current < 0.3) {
          speedRef.current = 0
          cancelAnimationFrame(frameRef.current!)
          setTimeout(() => setPhase('logo'), 300)
          return
        }
        angleRef.current += speedRef.current
        setRotation(angleRef.current)
        frameRef.current = requestAnimationFrame(animate)
      }
      frameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'logo') {
      setTimeout(() => setPhase('letters'), 600)
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
            setOpacity(0)
            setTimeout(() => onComplete(), 600)
          }, 800)
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [phase])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      opacity,
      transition: 'opacity 0.6s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

        {/* Rrethi spinner + Logo */}
        <div style={{ position: 'relative', width: '70px', height: '70px' }}>

          {/* Rrethi rrotullues */}
          <svg
            width="70" height="70"
            viewBox="0 0 70 70"
            style={{
              position: 'absolute', inset: 0,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <circle
              cx="35" cy="35" r="32"
              fill="none"
              stroke="#e50914"
              strokeWidth="3"
              strokeDasharray="140 60"
              strokeLinecap="round"
            />
          </svg>

          {/* Logo shfaqet kur ndalon */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: phase === 'logo' || phase === 'letters' || phase === 'done' ? 1 : 0,
            transform: phase === 'logo' || phase === 'letters' ? 'scale(1)' : 'scale(0.5)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}>
            <img
              src="/logo.svg"
              alt="Cineal"
              style={{
                width: '52px', height: '52px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 12px rgba(229,9,20,0.8))',
              }}
            />
          </div>
        </div>

        {/* Shkronjat CINEAL */}
        {(phase === 'letters') && (
          <div style={{ display: 'flex', gap: '1px' }}>
            {letters.map((letter, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '52px',
                  color: i === 0 ? '#e50914' : '#fff',
                  textShadow: '0 0 20px rgba(229,9,20,0.5)',
                  opacity: i < visibleLetters ? 1 : 0,
                  transform: i < visibleLetters ? 'translateX(0) scaleY(1)' : 'translateX(-10px) scaleY(0.8)',
                  transition: 'all 0.12s ease',
                  display: 'inline-block',
                  lineHeight: 1,
                }}
              >
                {letter}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}