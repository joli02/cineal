'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const KIDS_CATEGORIES = [
  { id: '2-6', label: 'Për 2–6 Vjeç', desc: 'Animacione të buta dhe ngjyrosëse' },
  { id: '7plus', label: 'Për 7+', desc: 'Aventura dhe histori emocionuese' },
  { id: 'family', label: 'Familje', desc: 'Për të gjithë bashkë' },
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

  const filtered = activeCategory
    ? movies.filter(m => m.kids_category === activeCategory)
    : movies

  return (
    <div style={{ background: '#262424', minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a1818 0%, #2a2020 100%)', padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 60px)', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 700, marginBottom: '12px' }}>
          Kids
        </h1>
        <p style={{ fontSize: '15px', color: '#b0b0c0', maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.6 }}>
          Filma dhe animacione të sigurta për fëmijë — pa dhunë, pa përmbajtje jo të përshtatshme
        </p>

        {/* Subcategories */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveCategory('')}
            style={{
              padding: '10px 22px', borderRadius: '24px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
              background: !activeCategory ? '#e50914' : 'rgba(255,255,255,0.06)',
              border: !activeCategory ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontFamily: "'DM Sans', sans-serif",
            }}>
            Të gjitha
          </button>
          {KIDS_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '10px 22px', borderRadius: '24px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
                background: activeCategory === cat.id ? '#e50914' : 'rgba(255,255,255,0.06)',
                border: activeCategory === cat.id ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontFamily: "'DM Sans', sans-serif",
              }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Movies grid */}
      <div style={{ padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 60px)' }}>
        {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#6b6b80' }}>Duke ngarkuar...</div>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px', color: '#6b6b80' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
            <div style={{ fontSize: '16px' }}>Nuk ka filma akoma në këtë kategori</div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px' }}>
            {filtered.map((m: any) => (
              <Link key={m.id} href={`/film/${m.slug}?play=true`} style={{ textDecoration: 'none' }}>
                <div style={{ borderRadius: '10px', overflow: 'hidden', background: '#1a1818', cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                  {m.poster_url
                    ? <img src={m.poster_url} alt={m.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ width: '100%', aspectRatio: '2/3', background: '#2a2020', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🎬</div>
                  }
                  <div style={{ padding: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title_sq || m.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#6b6b80' }}>{m.year}</span>
                      {m.rating && <span style={{ fontSize: '11px', color: '#f5a623' }}>★ {m.rating}</span>}
                    </div>
                    {m.kids_category && (
                      <span style={{ fontSize: '10px', background: 'rgba(229,9,20,0.15)', color: '#e50914', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', display: 'inline-block' }}>
                        {KIDS_CATEGORIES.find(c => c.id === m.kids_category)?.label || m.kids_category}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
