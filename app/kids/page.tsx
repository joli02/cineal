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

  // Group by kids_category for display
  const byCategory = KIDS_CATEGORIES.map(cat => ({
    ...cat,
    movies: movies.filter(m => m.kids_category === cat.id).slice(0, 10)
  })).filter(c => c.movies.length > 0)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ padding: 'clamp(40px, 6vw, 60px) clamp(16px, 4vw, 60px) 20px' }}>
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, marginBottom: '8px' }}>Kids</h1>
        <p style={{ fontSize: '14px', color: '#b0b0c0', marginBottom: '24px' }}>
          Filma dhe animacione të sigurta për fëmijë
        </p>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
          <button onClick={() => setActiveCategory('')}
            style={{ background: !activeCategory ? '#e50914' : 'rgba(255,255,255,0.05)', border: !activeCategory ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.08)', color: !activeCategory ? '#fff' : '#b0b0c0', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Të gjitha
          </button>
          {KIDS_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              style={{ background: activeCategory === cat.id ? '#e50914' : 'rgba(255,255,255,0.05)', border: activeCategory === cat.id ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.08)', color: activeCategory === cat.id ? '#fff' : '#b0b0c0', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 clamp(16px, 4vw, 60px) 60px' }}>
        {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#6b6b80' }}>Duke ngarkuar...</div>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px', color: '#6b6b80' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
            <div>Nuk ka filma akoma në këtë kategori</div>
          </div>
        )}

        {/* Show by category when "all" selected */}
        {!loading && !activeCategory && byCategory.map(cat => (
          <div key={cat.id} style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600 }}>{cat.label}</h2>
            </div>
            <div className="category-scroll">
              {cat.movies.map((m: any) => (
                <div key={m.id} className="category-item">
                  <Link href={`/film/${m.slug}?play=true`} style={{ textDecoration: 'none' }}>
                    <div style={{ borderRadius: '8px', overflow: 'hidden', background: '#1a1818', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                      {m.poster_url
                        ? <img src={m.poster_url} alt={m.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                        : <div style={{ width: '100%', aspectRatio: '2/3', background: '#2a2020', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🎬</div>
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

        {/* Show flat grid when category selected */}
        {!loading && activeCategory && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
            {filtered.map((m: any) => (
              <Link key={m.id} href={`/film/${m.slug}?play=true`} style={{ textDecoration: 'none' }}>
                <div style={{ borderRadius: '8px', overflow: 'hidden', background: '#1a1818', cursor: 'pointer' }}>
                  {m.poster_url
                    ? <img src={m.poster_url} alt={m.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                    : <div style={{ width: '100%', aspectRatio: '2/3', background: '#2a2020' }} />
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
        .category-scroll {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 12px;
        }
        .category-item { width: 100%; }
        @media (max-width: 768px) {
          .category-scroll {
            display: flex;
            overflow-x: auto;
            gap: 10px;
            padding-bottom: 8px;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .category-scroll::-webkit-scrollbar { display: none; }
          .category-item {
            flex: 0 0 calc(50% - 5px);
            min-width: calc(50% - 5px);
            scroll-snap-align: start;
          }
        }
      `}</style>
    </div>
  )
}
