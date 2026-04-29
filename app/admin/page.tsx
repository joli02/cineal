'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const NAV = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'add', icon: '＋', label: 'Shto Film' },
  { id: 'movies', icon: '🎬', label: 'Filmat' },
  { id: 'users', icon: '👥', label: 'Userat' },
  { id: 'settings', icon: '⚙', label: 'Cilësimet' },
]

export default function AdminPage() {
  const [active, setActive] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [toastErr, setToastErr] = useState(false)
  const router = useRouter()

  // Stats
  const [stats, setStats] = useState({ movies: 0, users: 0, views: 0 })

  // Add movie form
  const [title, setTitle] = useState('')
  const [titleSq, setTitleSq] = useState('')
  const [year, setYear] = useState('')
  const [genre, setGenre] = useState('Aksion')
  const [duration, setDuration] = useState('')
  const [rating, setRating] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [posterUrl, setPosterUrl] = useState('')
  const [backdropUrl, setBackdropUrl] = useState('')
  const [subtitleUrl, setSubtitleUrl] = useState('')
  const [isTrending, setIsTrending] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)

  // Movies list
  const [movies, setMovies] = useState<any[]>([])
  const [editMovie, setEditMovie] = useState<any>(null)

  // Users list
  const [users, setUsers] = useState<any[]>([])
  const [vipDays, setVipDays] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchStats()
    if (active === 'movies') fetchMovies()
    if (active === 'users') fetchUsers()
    if (active === 'dashboard') { fetchStats(); fetchMovies(); fetchUsers() }
  }, [active])

  async function fetchStats() {
    const { count: mc } = await supabase.from('movies').select('*', { count: 'exact', head: true })
    const { count: uc } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { data: vd } = await supabase.from('movies').select('views')
    const totalViews = vd?.reduce((s, m) => s + (m.views || 0), 0) || 0
    setStats({ movies: mc || 0, users: uc || 0, views: totalViews })
  }

  async function fetchMovies() {
    const { data } = await supabase.from('movies').select('*').order('created_at', { ascending: false })
    setMovies(data || [])
  }

  async function fetchUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
  }

  const showToast = (msg: string, err = false) => {
    setToast(msg); setToastErr(err)
    setTimeout(() => setToast(''), 3000)
  }

  const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const resetForm = () => {
    setTitle(''); setTitleSq(''); setYear(''); setGenre('Aksion')
    setDuration(''); setRating(''); setDescription(''); setVideoUrl('')
    setPosterUrl(''); setBackdropUrl(''); setSubtitleUrl('')
    setIsTrending(false); setIsFeatured(false)
  }

  const handleAdd = async () => {
    if (!title.trim()) { showToast('Titulli është i detyrueshëm!', true); return }
    if (!videoUrl.trim()) { showToast('Video URL është e detyrueshme!', true); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('movies').insert({
        title: title.trim(), title_sq: titleSq.trim() || title.trim(),
        slug: slug(title), year: year ? parseInt(year) : null,
        genre, duration: duration || null, rating: rating ? parseFloat(rating) : null,
        description: description || null, video_url: videoUrl.trim(),
        poster_url: posterUrl || null, backdrop_url: backdropUrl || null,
        subtitle_url: subtitleUrl || null, is_trending: isTrending,
        is_featured: isFeatured, status: 'live', views: 0,
      })
      if (error) throw error
      showToast(`"${title}" u shtua! ✓`)
      resetForm(); fetchStats()
    } catch (e: any) { showToast(e.message, true) }
    setLoading(false)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Fshi "${title}"?`)) return
    await supabase.from('movies').delete().eq('id', id)
    showToast(`"${title}" u fshi!`)
    fetchMovies(); fetchStats()
  }

  const handleSaveEdit = async () => {
    if (!editMovie) return
    setLoading(true)
    try {
      const { error } = await supabase.from('movies').update({
        title: editMovie.title, title_sq: editMovie.title_sq,
        year: editMovie.year, genre: editMovie.genre,
        duration: editMovie.duration, rating: editMovie.rating,
        description: editMovie.description, video_url: editMovie.video_url,
        poster_url: editMovie.poster_url, backdrop_url: editMovie.backdrop_url,
        subtitle_url: editMovie.subtitle_url, is_trending: editMovie.is_trending,
        status: editMovie.status,
      }).eq('id', editMovie.id)
      if (error) throw error
      showToast('Film u përditësua! ✓')
      setEditMovie(null); fetchMovies()
    } catch (e: any) { showToast(e.message, true) }
    setLoading(false)
  }

  const handleSetVip = async (userId: string, days: number) => {
    const expires = new Date()
    expires.setDate(expires.getDate() + days)
    await supabase.from('profiles').update({
      role: 'vip', vip_expires_at: expires.toISOString()
    }).eq('id', userId)
    showToast(`VIP aktivizuar për ${days} ditë! ✓`)
    fetchUsers()
  }

  const handleRemoveVip = async (userId: string) => {
    await supabase.from('profiles').update({ role: 'free', vip_expires_at: null }).eq('id', userId)
    showToast('VIP u hoq!')
    fetchUsers()
  }

  const handleBlock = async (userId: string, status: string) => {
    const newStatus = status === 'blocked' ? 'active' : 'blocked'
    await supabase.from('profiles').update({ status: newStatus }).eq('id', userId)
    showToast(newStatus === 'blocked' ? 'User u bllokua!' : 'User u aktivizua!')
    fetchUsers()
  }

  const inp: React.CSSProperties = {
    background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', padding: '10px 14px', borderRadius: '5px',
    fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box'
  }

  const s = (id: string) => ({
    background: active === id ? 'rgba(229,9,20,0.08)' : 'transparent',
    borderLeft: active === id ? '2px solid #e50914' : '2px solid transparent',
    color: active === id ? '#fff' : '#6b6b80',
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>

      {/* SIDEBAR */}
      <div style={{ background: '#12121a', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: '22px', letterSpacing: '3px', fontWeight: 700 }}>
            <span style={{ color: '#e50914' }}>C</span>INEAL
          </div>
          <div style={{ fontSize: '10px', color: '#ff6b6b', marginTop: '4px' }}>Admin Panel</div>
        </div>
        <div style={{ flex: 1, padding: '8px 0' }}>
          {NAV.map(item => (
            <div key={item.id} onClick={() => setActive(item.id)}
              style={{ ...s(item.id), display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <a href="/" style={{ fontSize: '12px', color: '#6b6b80', textDecoration: 'none' }}>← Kthehu te faqja</a>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#12121a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 500 }}>
            {NAV.find(n => n.id === active)?.label}
          </div>
          <button onClick={() => setActive('add')} style={{ background: '#e50914', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>+ Shto Film</button>
        </div>

        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>

          {/* DASHBOARD */}
          {active === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '24px' }}>
                {[
                  { label: 'Filma Gjithsej', value: stats.movies, icon: '🎬', color: '#3b82f6' },
                  { label: 'Userat', value: stats.users, icon: '👥', color: '#22c55e' },
                  { label: 'Shikime Totale', value: stats.views, icon: '👁', color: '#f5a623' },
                ].map((sc, i) => (
                  <div key={i} style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{sc.icon}</div>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: sc.color }}>{sc.value}</div>
                    <div style={{ fontSize: '12px', color: '#6b6b80', marginTop: '4px' }}>{sc.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Filmat e Fundit</div>
                  {movies.slice(0, 5).map((m: any) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {m.poster_url && <img src={m.poster_url} alt={m.title} style={{ width: '30px', height: '44px', objectFit: 'cover', borderRadius: '3px' }} />}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>{m.title}</div>
                        <div style={{ fontSize: '11px', color: '#6b6b80' }}>{m.year} · {m.genre}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Userat e Fundit</div>
                  {users.slice(0, 5).map((u: any) => (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#b0b0c0' }}>
                        {u.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>{u.email}</div>
                        <div style={{ fontSize: '11px', color: u.role === 'vip' ? '#f5a623' : '#6b6b80' }}>{(u.role || 'free').toUpperCase()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ADD MOVIE */}
          {active === 'add' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '900px' }}>
              {[
                { label: 'Titulli * (anglisht)', val: title, set: setTitle, ph: 'Inception' },
                { label: 'Titulli Shqip', val: titleSq, set: setTitleSq, ph: 'Fillimi' },
                { label: 'Viti', val: year, set: setYear, ph: '2025', type: 'number' },
                { label: 'Kohëzgjatja', val: duration, set: setDuration, ph: '2h 14min' },
                { label: 'Rating IMDb', val: rating, set: setRating, ph: '7.5', type: 'number' },
              ].map(({ label, val, set, ph, type }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</label>
                  <input value={val} onChange={e => set(e.target.value)} placeholder={ph} type={type || 'text'} style={inp} />
                </div>
              ))}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Zhanri</label>
                <select value={genre} onChange={e => setGenre(e.target.value)} style={inp}>
                  {['Aksion', 'Drama', 'Comedy', 'Sci-Fi', 'Thriller', 'Horror', 'Anime', 'Romance', 'Dokumentar'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Përshkrimi</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Përshkrimi shqip..." rows={3} style={{ ...inp, resize: 'vertical' }} />
              </div>

              <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Video URL * (Bunny embed / HLS)</label>
                <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://iframe.mediadelivery.net/embed/647882/VIDEO_ID?captions=sq" style={inp} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Poster URL</label>
                <input value={posterUrl} onChange={e => setPosterUrl(e.target.value)} placeholder="https://image.tmdb.org/t/p/w500/..." style={inp} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Backdrop URL</label>
                <input value={backdropUrl} onChange={e => setBackdropUrl(e.target.value)} placeholder="https://image.tmdb.org/t/p/original/..." style={inp} />
              </div>

              <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Titra URL (.vtt) — opsionale nëse janë te Bunny</label>
                <input value={subtitleUrl} onChange={e => setSubtitleUrl(e.target.value)} placeholder="https://cinealsubtitles.b-cdn.net/film-sq.vtt" style={inp} />
              </div>

              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#b0b0c0' }}>
                  <input type="checkbox" checked={isTrending} onChange={e => setIsTrending(e.target.checked)} style={{ accentColor: '#e50914', width: '16px', height: '16px' }} />
                  🔥 Trending
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#b0b0c0' }}>
                  <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ accentColor: '#e50914', width: '16px', height: '16px' }} />
                  ⭐ Featured Hero
                </label>
              </div>

              <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px' }}>
                <button onClick={handleAdd} disabled={loading}
                  style={{ background: loading ? '#444' : '#e50914', border: 'none', color: '#fff', padding: '12px 28px', borderRadius: '5px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? '⏳ Duke shtuar...' : '✓ Shto Filmin'}
                </button>
                <button onClick={resetForm}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#b0b0c0', padding: '12px 20px', borderRadius: '5px', fontSize: '13px', cursor: 'pointer' }}>
                  ✕ Pastro
                </button>
              </div>
            </div>
          )}

          {/* MOVIES LIST */}
          {active === 'movies' && (
            <div>
              {editMovie && (
                <div style={{ background: '#12121a', border: '1px solid rgba(229,9,20,0.3)', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px', color: '#e50914' }}>✏️ Po edito: {editMovie.title}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { label: 'Titulli', key: 'title' },
                      { label: 'Viti', key: 'year' },
                      { label: 'Rating', key: 'rating' },
                      { label: 'Kohëzgjatja', key: 'duration' },
                      { label: 'Video URL', key: 'video_url' },
                      { label: 'Poster URL', key: 'poster_url' },
                    ].map(({ label, key }) => (
                      <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase' }}>{label}</label>
                        <input value={editMovie[key] || ''} onChange={e => setEditMovie({ ...editMovie, [key]: e.target.value })} style={inp} />
                      </div>
                    ))}
                    <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px' }}>
                      <button onClick={handleSaveEdit} disabled={loading}
                        style={{ background: '#22c55e', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '5px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                        ✓ Ruaj ndryshimet
                      </button>
                      <button onClick={() => setEditMovie(null)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#b0b0c0', padding: '10px 16px', borderRadius: '5px', fontSize: '13px', cursor: 'pointer' }}>
                        Anulo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['', 'Titulli', 'Viti', 'Zhanri', 'Shikime', 'Status', 'Veprime'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '9px 12px', fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {movies.map((m: any) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 12px' }}>
                        {m.poster_url && <img src={m.poster_url} alt={m.title} style={{ width: '30px', height: '44px', objectFit: 'cover', borderRadius: '3px' }} />}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 500 }}>{m.title}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#b0b0c0' }}>{m.year}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#b0b0c0' }}>{m.genre}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#b0b0c0' }}>{m.views || 0}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: m.status === 'live' ? 'rgba(34,197,94,0.1)' : 'rgba(245,166,35,0.1)', color: m.status === 'live' ? '#22c55e' : '#f5a623', fontSize: '11px', padding: '2px 8px', borderRadius: '3px', border: `1px solid ${m.status === 'live' ? 'rgba(34,197,94,0.3)' : 'rgba(245,166,35,0.3)'}` }}>
                          {m.status === 'live' ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => setEditMovie(m)}
                            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', padding: '4px 10px', borderRadius: '3px', fontSize: '11px', cursor: 'pointer' }}>
                            Edito
                          </button>
                          <button onClick={() => handleDelete(m.id, m.title)}
                            style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', padding: '4px 10px', borderRadius: '3px', fontSize: '11px', cursor: 'pointer' }}>
                            Fshi
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* USERS */}
          {active === 'users' && (
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['Email', 'Roli', 'VIP Skadon', 'Statusi', 'Veprime'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '9px 12px', fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px', fontSize: '13px' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: u.role === 'vip' ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.05)', color: u.role === 'vip' ? '#f5a623' : '#6b6b80', fontSize: '11px', padding: '2px 8px', borderRadius: '3px', fontWeight: 500 }}>
                          {(u.role || 'FREE').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '12px', color: '#6b6b80' }}>
                        {u.vip_expires_at ? new Date(u.vip_expires_at).toLocaleDateString('sq-AL') : '—'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: u.status === 'blocked' ? 'rgba(255,107,107,0.1)' : 'rgba(34,197,94,0.1)', color: u.status === 'blocked' ? '#ff6b6b' : '#22c55e', fontSize: '11px', padding: '2px 8px', borderRadius: '3px' }}>
                          {u.status === 'blocked' ? 'Bllokuar' : 'Aktiv'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {u.role !== 'vip' ? (
                            <>
                              {[
                                { label: 'VIP 1 Muaj', days: 30 },
                                { label: 'VIP 6 Muaj', days: 180 },
                                { label: 'VIP 1 Vit', days: 365 },
                              ].map(({ label, days }) => (
                                <button key={days} onClick={() => handleSetVip(u.id, days)}
                                  style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', color: '#f5a623', padding: '4px 8px', borderRadius: '3px', fontSize: '10px', cursor: 'pointer' }}>
                                  ⭐ {label}
                                </button>
                              ))}
                            </>
                          ) : (
                            <button onClick={() => handleRemoveVip(u.id)}
                              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#b0b0c0', padding: '4px 10px', borderRadius: '3px', fontSize: '10px', cursor: 'pointer' }}>
                              Hiq VIP
                            </button>
                          )}
                          <button onClick={() => handleBlock(u.id, u.status)}
                            style={{ background: u.status === 'blocked' ? 'rgba(34,197,94,0.1)' : 'rgba(255,107,107,0.1)', border: `1px solid ${u.status === 'blocked' ? 'rgba(34,197,94,0.3)' : 'rgba(255,107,107,0.3)'}`, color: u.status === 'blocked' ? '#22c55e' : '#ff6b6b', padding: '4px 10px', borderRadius: '3px', fontSize: '10px', cursor: 'pointer' }}>
                            {u.status === 'blocked' ? 'Aktivizo' : 'Blloko'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SETTINGS */}
          {active === 'settings' && (
            <div style={{ maxWidth: '600px' }}>
              <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '24px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px', color: '#b0b0c0' }}>🐰 Bunny.net Konfigurimi</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Library ID</label>
                    <input defaultValue="647882" style={inp} readOnly />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Subtitles CDN</label>
                    <input defaultValue="https://cinealsubtitles.b-cdn.net" style={inp} readOnly />
                  </div>
                  <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '6px', padding: '12px', fontSize: '12px', color: '#22c55e' }}>
                    💡 Embed URL format: https://iframe.mediadelivery.net/embed/647882/VIDEO_ID?captions=sq
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: toastErr ? '#1f0d0d' : '#0d1f0d', border: `1px solid ${toastErr ? 'rgba(255,107,107,0.4)' : 'rgba(34,197,94,0.4)'}`, color: toastErr ? '#ff6b6b' : '#22c55e', padding: '12px 20px', borderRadius: '8px', fontSize: '13px', zIndex: 9999 }}>
          {toastErr ? '✗ ' : '✓ '}{toast}
        </div>
      )}
    </div>
  )
}