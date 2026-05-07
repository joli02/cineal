'use client'
import { useEffect, useRef, useState } from 'react'

export default function CinealIntro({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<'particles' | 'logo' | 'zoom' | 'out'>('particles')
  const [logoScale, setLogoScale] = useState(0)
  const [logoOpacity, setLogoOpacity] = useState(0)
  const [logoGlow, setLogoGlow] = useState(0)
  const [screenOpacity, setScreenOpacity] = useState(1)
  const animRef = useRef<number>()
  const startTimeRef = useRef<number>(0)

  // Canvas particle animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const cx = canvas.width / 2
    const cy = canvas.height / 2

    // Krijon grimcat
    const count = 120
    type Particle = {
      x: number; y: number
      tx: number; ty: number
      vx: number; vy: number
      size: number; opacity: number
      color: string; speed: number
      angle: number; radius: number
    }

    const colors = ['#e50914', '#ff2020', '#ff6b6b', '#ffffff', '#ff4040', '#cc0000']

    const particles: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2
      const radius = 180 + Math.random() * 300
      return {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        tx: cx + (Math.random() - 0.5) * 60,
        ty: cy + (Math.random() - 0.5) * 60,
        vx: 0, vy: 0,
        size: 1.5 + Math.random() * 3,
        opacity: 0.4 + Math.random() * 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.03 + Math.random() * 0.04,
        angle, radius
      }
    })

    let progress = 0
    let done = false

    const draw = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time
      const elapsed = time - startTimeRef.current

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Progress 0→1 brenda 1.4 sekondave
      progress = Math.min(elapsed / 1400, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic

      // Vizato grimcat
      particles.forEach(p => {
        const x = p.x + (p.tx - p.x) * eased
        const y = p.y + (p.ty - p.y) * eased
        const op = p.opacity * (0.3 + eased * 0.7)
        const sz = p.size * (0.5 + eased * 0.5)

        ctx.beginPath()
        ctx.arc(x, y, sz, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = op
        ctx.fill()
        ctx.globalAlpha = 1

        // Trail / bisht
        if (eased < 0.85) {
          const tx2 = p.x + (p.tx - p.x) * Math.max(0, eased - 0.15)
          const ty2 = p.y + (p.ty - p.y) * Math.max(0, eased - 0.15)
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(tx2, ty2)
          ctx.strokeStyle = p.color
          ctx.globalAlpha = op * 0.3
          ctx.lineWidth = sz * 0.5
          ctx.stroke()
          ctx.globalAlpha = 1
        }
      })

      // Pulse rrethi qendror
      if (eased > 0.5) {
        const pulseOp = (eased - 0.5) * 2
        const pulseR = 30 * pulseOp
        ctx.beginPath()
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(229,9,20,${pulseOp * 0.3})`
        ctx.fill()

        // Glow rreth qendrës
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80)
        grad.addColorStop(0, `rgba(229,9,20,${pulseOp * 0.25})`)
        grad.addColorStop(1, 'rgba(229,9,20,0)')
        ctx.beginPath()
        ctx.arc(cx, cy, 80, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(draw)
      } else if (!done) {
        done = true
        setPhase('logo')
      }
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current!)
  }, [])

  // Logo phases
  useEffect(() => {
    if (phase === 'logo') {
      // Logo shfaqet me scale-up
      setTimeout(() => {
        setLogoOpacity(1)
        setLogoScale(1)
        setLogoGlow(1)
      }, 50)

      // Pas 600ms fillo zoom
      setTimeout(() => setPhase('zoom'), 650)
    }

    if (phase === 'zoom') {
      // Logo zmadhohet
      setTimeout(() => {
        setLogoScale(2.8)
        setLogoGlow(3)
        setLogoOpacity(0)
      }, 50)

      // Fade out ekrani
      setTimeout(() => {
        setScreenOpacity(0)
      }, 400)

      // Thirr onComplete
      setTimeout(() => {
        onComplete()
      }, 900)
    }
  }, [phase])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: screenOpacity,
      transition: phase === 'zoom' ? 'opacity 0.5s ease' : 'none',
    }}>
      {/* Canvas grimcat */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* Logo */}
      {(phase === 'logo' || phase === 'zoom') && (
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img
            src="/logo.svg"
            alt="Cineal"
            style={{
              width: '90px',
              height: '90px',
              objectFit: 'contain',
              opacity: logoOpacity,
              transform: `scale(${logoScale})`,
              filter: `drop-shadow(0 0 ${logoGlow * 20}px rgba(229,9,20,0.9)) drop-shadow(0 0 ${logoGlow * 40}px rgba(229,9,20,0.5))`,
              transition: phase === 'logo'
                ? 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1), filter 0.4s ease'
                : 'opacity 0.35s ease, transform 0.5s cubic-bezier(0.4,0,1,1), filter 0.3s ease',
            }}
          />
        </div>
      )}
    </div>
  )
}
