'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function FilmPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [movie, setMovie] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMovie() {
      const { data } = await supabase
        .from('movies')
        .select('*')
        .eq('slug', slug)
        .single()
      setMovie(data)
      setLoading(false)
    }
    if (slug) fetchMovie()
  }, [slug])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#6b6b80', fontSize: '16px' }}>Duke ngarkuar...</div>
    </div>
  )

  if (!movie) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
        <div style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>Filmi nuk u gjet</div>
        <Link href="/" style={{ color: '#e50914', textDecoration: 'none' }}>← Kthehu</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* Backdrop */}
      <div style={{ position: 'relative', height: '50vh', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${movie.backdrop_url || movie.poster_url})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.3)'
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a0f 0%, transparent 60%)' }} />
      </div>

      {/* Info */}
      <div style={{ padding: '0 60px 60px', marginTop: '-120px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

          {/* Poster */}
          {movie.poster_url && (
            <img src={movie.poster_url} alt={movie.title}
              style={{ width: '180px', borderRadius: '8px', flexShrink: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
          )}

          {/* Details */}
          <div style={{ flex: 1, paddingTop: '40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
              {movie.title_sq || movie.title}
            </h1>
            <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#b0b0c0', marginBottom: '16px', flexWrap: 'wrap' }}>
              {movie.year && <span>{movie.year}</span>}
              {movie.genre && <><span>•</span><span>{movie.genre}</span></>}
              {movie.rating && <><span>•</span><span>⭐ {movie.rating}</span></>}
              {movie.duration && <><span>•</span><span>{movie.duration}</span></>}
            </div>
            {movie.description && (
              <p style={{ fontSize: '14px', color: '#b0b0c0', lineHeight: 1.7, maxWidth: '600px', marginBottom: '24px' }}>
                {movie.description}
              </p>
            )}
          </div>
        </div>

        {/* VIDEO PLAYER */}
        {(movie.video_url || movie.embed_url) && (
          <div style={{ marginTop: '32px', borderRadius: '12px', overflow: 'hidden', background: '#000', aspectRatio: '16/9', maxWidth: '900px' }}>
            <iframe
              src={movie.video_url || movie.embed_url}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowFullScreen
              allow="autoplay; fullscreen"
            />
          </div>
        )}

        <div style={{ marginTop: '16px' }}>
          <Link href="/" style={{ color: '#e50914', textDecoration: 'none', fontSize: '14px' }}>← Kthehu te kryefaqja</Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}