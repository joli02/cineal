'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const KIDS_CATEGORIES = [
  { id: '2-6', label: 'Për 2–6 Vjeç' },
  { id: '7plus', label: 'Për 7+' },
  { id: 'family', label: 'Familje' },
]

export default function KidsPage() {
  const [activeCategory, setActiveCategory] = useState('')
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMovies() {
      const { data } = await supabase
        .from('movies')
        .select('*')
        .eq('status', 'live')
        .eq('is_kids', true)
        .order('created_at', { ascending: false })
      if (data) setMovies(data)
      setLoading(false)
    }
    fetchMovies()
  }, [])

  const filtered = activeCategory ? movies.filter(m => m.kids_category === activeCategory) : movies

  const byCategory = KIDS_CATEGORIES.map(cat => ({
    ...cat,
    movies: movies.filter(m => m.kids_category === cat.id).slice(0, 10)
  })).filter(c => c.movies.length > 0)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* Hero banner */}
      <div style={{ position: 'relative', height: 'clamp(380px, 65vh, 650px)', overflow: 'hidden' }}>
        {/* Banner image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(/kids-cinema-watching-movie-with-popcorn.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          filter: 'brightness(1)',
        }} />
        {/* Gradient nga e majta */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(10,10,15,0.95) 30%, rgba(10,10,15,0.6) 55%, rgba(10,10,15,0.15) 80%, transparent 100%)',
        }} />
        {/* Gradient poshtë */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, #0a0a0f 0%, transparent 50%)',
        }} />

        {/* Info mbi hero */}
        <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(60px, 10vw, 100px) clamp(20px, 5vw, 60px) 40px', maxWidth: '560px' }}>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 700, marginBottom: '14px', lineHeight: 1.1 }}>
            Kids Zone
          </h1>
          <p style={{ fontSize: '15px', color: '#b0b0c0', lineHeight: 1.7, marginBottom: '28px', maxWidth: '420px' }}>
            Kids Zone është një hapësirë e sigurt dhe argëtuese për fëmijë dhe familje,
            me filma të përshtatshëm për moshat, animacione, përmbajtje edukative dhe aventura familjare.
          </p>

          {/* Category buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveCategory('')}
              style={{ padding: '8px 20px', borderRadius: '24px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif", background: !activeCategory ? '#e50914' : 'rgba(255,255,255,0.12)', border: !activeCategory ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
              Të gjitha
            </button>
            {KIDS_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                style={{ padding: '8px 20px', borderRadius: '24px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif", background: activeCategory === cat.id ? '#e50914' : 'rgba(255,255,255,0.12)', border: activeCategory === cat.id ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Movies */}
      <div style={{ padding: '32px clamp(16px, 4vw, 60px) 60px' }}>
        {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#6b6b80' }}>Duke ngarkuar...</div>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px', color: '#6b6b80' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
            <div>Nuk ka filma akoma në këtë kategori</div>
          </div>
        )}

        {/* By category when all selected */}
        {!loading && !activeCategory && byCategory.map(cat => (
          <div key={cat.id} style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600, marginBottom: '16px' }}>{cat.label}</h2>
            <div className="kids-scroll">
              {cat.movies.map((m: any) => (
                <div key={m.id} className="kids-item">
                  <Link href={`/film/${m.slug}?play=true`} style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '8px', overflow: 'hidden', background: '#12121a', cursor: 'pointer', transition: 'transform 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                      {m.poster_url
                        ? <img src={m.poster_url} alt={m.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                        : <div style={{ width: '100%', aspectRatio: '2/3', background: '#1a1a2e' }} />
                      }
                      <div style={{ padding: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title_sq || m.title}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#6b6b80' }}>{m.year}</span>
                          {m.rating && <span style={{ fontSize: '11px', color: '#f5a623' }}>★ {m.rating}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Flat grid when category selected */}
        {!loading && activeCategory && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
            {filtered.map((m: any) => (
              <Link key={m.id} href={`/film/${m.slug}?play=true`} style={{ textDecoration: 'none' }}>
                <div style={{ borderRadius: '8px', overflow: 'hidden', background: '#12121a', cursor: 'pointer' }}>
                  {m.poster_url
                    ? <img src={m.poster_url} alt={m.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ width: '100%', aspectRatio: '2/3', background: '#1a1a2e' }} />
                  }
                  <div style={{ padding: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title_sq || m.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#6b6b80' }}>{m.year}</span>
                      {m.rating && <span style={{ fontSize: '11px', color: '#f5a623' }}>★ {m.rating}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        .kids-scroll {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px;
        }
        .kids-item { width: 100%; }
        @media (max-width: 768px) {
          .kids-scroll {
            display: flex;
            overflow-x: auto;
            gap: 10px;
            padding-bottom: 8px;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .kids-scroll::-webkit-scrollbar { display: none; }
          .kids-item {
            flex: 0 0 calc(50% - 5px);
            min-width: calc(50% - 5px);
            scroll-snap-align: start;
          }
        }
      `}</style>
    </div>
  )
}
