 
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [active, setActive] = useState('add')
  const [toast, setToast] = useState('')
  const [toastError, setToastError] = useState(false)
  const [loading, setLoading] = useState(false)
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

  const showToast = (msg: string, err = false) => {
    setToast(msg); setToastError(err)
    setTimeout(() => setToast(''), 3500)
  }

  const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')

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
        title: title.trim(),
        title_sq: titleSq.trim() || title.trim(),
        slug: slug(title),
        year: year ? parseInt(year) : null,
        genre,
        duration: duration || null,
        rating: rating ? parseFloat(rating) : null,
        description: description || null,
        video_url: videoUrl.trim(),
        poster_url: posterUrl || null,
        backdrop_url: backdropUrl || null,
        subtitle_url: subtitleUrl || null,
        is_trending: isTrending,
        is_featured: isFeatured,
        status: 'live',
        views: 0,
      })
      if (error) throw error
      showToast(`"${title}" u shtua me sukses!`)
      resetForm()
    } catch (e: any) {
      showToast('Gabim: ' + e.message, true)
    }
    setLoading(false)
  }

  const NAV = [
    { id:'dashboard', icon:'⊞', label:'Dashboard' },
    { id:'add', icon:'＋', label:'Shto Film' },
    { id:'movies', icon:'🎬', label:'Filmat' },
    { id:'users', icon:'👥', label:'Userat' },
    { id:'settings', icon:'⚙', label:'Cilësimet' },
  ]

  const inp: React.CSSProperties = {
    background:'#12121a', border:'1px solid rgba(255,255,255,0.07)',
    color:'#fff', padding:'10px 14px', borderRadius:'5px',
    fontSize:'13px', outline:'none', width:'100%', boxSizing:'border-box'
  }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', minHeight:'100vh', background:'#0a0a0f', color:'#fff', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ background:'#12121a', borderRight:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'20px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize:'22px', letterSpacing:'3px', fontWeight:700 }}>
            <span style={{ color:'#e50914' }}>C</span>INEAL
          </div>
          <div style={{ fontSize:'10px', color:'#ff6b6b', marginTop:'4px' }}>Admin Panel</div>
        </div>
        <div style={{ flex:1, padding:'8px 0' }}>
          {NAV.map(item => (
            <div key={item.id} onClick={() => setActive(item.id)}
              style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 20px', fontSize:'13px', cursor:'pointer',
                background: active===item.id ? 'rgba(229,9,20,0.08)' : 'transparent',
                borderLeft: active===item.id ? '2px solid #e50914' : '2px solid transparent',
                color: active===item.id ? '#fff' : '#6b6b80' }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'14px 28px', borderBottom:'1px solid rgba(255,255,255,0.07)', background:'#12121a', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:'15px', fontWeight:500 }}>
            {active==='add' ? 'Shto Film të Ri' : active==='movies' ? 'Filmat' : active==='users' ? 'Userat' : active==='settings' ? 'Cilësimet' : 'Dashboard'}
          </div>
          <button onClick={() => setActive('add')} style={{ background:'#e50914', border:'none', color:'#fff', padding:'8px 16px', borderRadius:'5px', fontSize:'12px', cursor:'pointer', fontWeight:500 }}>+ Shto Film</button>
        </div>

        <div style={{ padding:'24px 28px', overflowY:'auto', flex:1 }}>
          {active === 'add' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', maxWidth:'880px' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'1px' }}>Titulli * (anglisht)</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Inception" style={inp} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'1px' }}>Titulli Shqip</label>
                <input value={titleSq} onChange={e=>setTitleSq(e.target.value)} placeholder="Fillimi" style={inp} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'1px' }}>Viti</label>
                <input value={year} onChange={e=>setYear(e.target.value)} placeholder="2024" type="number" style={inp} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'1px' }}>Zhanri</label>
                <select value={genre} onChange={e=>setGenre(e.target.value)} style={inp}>
                  {['Aksion','Drama','Comedy','Sci-Fi','Thriller','Horror','Anime','Romance','Dokumentar'].map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'1px' }}>Kohëzgjatja</label>
                <input value={duration} onChange={e=>setDuration(e.target.value)} placeholder="2h 28min" style={inp} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'1px' }}>Vlerësimi IMDb</label>
                <input value={rating} onChange={e=>setRating(e.target.value)} placeholder="8.5" type="number" step="0.1" style={inp} />
              </div>
              <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'1px' }}>Përshkrimi</label>
                <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Përshkrim shqip..." rows={3} style={{ ...inp, resize:'vertical' }} />
              </div>
              <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'1px' }}>Video URL * (Bunny.net / YouTube embed / Direct)</label>
                <input value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID" style={{ ...inp, borderColor: !videoUrl ? 'rgba(229,9,20,0.4)' : 'rgba(255,255,255,0.07)' }} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'1px' }}>Poster URL</label>
                <input value={posterUrl} onChange={e=>setPosterUrl(e.target.value)} placeholder="https://image.tmdb.org/t/p/w500/..." style={inp} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'1px' }}>Backdrop URL</label>
                <input value={backdropUrl} onChange={e=>setBackdropUrl(e.target.value)} placeholder="https://image.tmdb.org/t/p/original/..." style={inp} />
              </div>
              <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'1px' }}>Titra Shqip URL (.vtt)</label>
                <input value={subtitleUrl} onChange={e=>setSubtitleUrl(e.target.value)} placeholder="https://.../subtitles-sq.vtt (opsional)" style={inp} />
              </div>
              <div style={{ gridColumn:'1/-1', display:'flex', gap:'20px' }}>
                <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'13px', color:'#b0b0c0' }}>
                  <input type="checkbox" checked={isTrending} onChange={e=>setIsTrending(e.target.checked)} style={{ accentColor:'#e50914', width:'16px', height:'16px' }} />
                  🔥 Trending
                </label>
                <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'13px', color:'#b0b0c0' }}>
                  <input type="checkbox" checked={isFeatured} onChange={e=>setIsFeatured(e.target.checked)} style={{ accentColor:'#e50914', width:'16px', height:'16px' }} />
                  ⭐ Featured Hero
                </label>
              </div>
              <div style={{ gridColumn:'1/-1', display:'flex', gap:'10px' }}>
                <button onClick={handleAdd} disabled={loading}
                  style={{ background: loading ? '#444' : '#e50914', border:'none', color:'#fff', padding:'12px 28px', borderRadius:'5px', fontSize:'14px', fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? '⏳ Duke shtuar...' : '✓ Shto Filmin'}
                </button>
                <button onClick={resetForm}
                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#b0b0c0', padding:'12px 20px', borderRadius:'5px', fontSize:'13px', cursor:'pointer' }}>
                  ✕ Pastro
                </button>
              </div>
            </div>
          )}

          {active !== 'add' && (
            <div style={{ textAlign:'center', padding:'80px 20px' }}>
              <div style={{ fontSize:'48px', marginBottom:'16px' }}>
                {active==='dashboard' ? '📊' : active==='movies' ? '🎬' : active==='users' ? '👥' : '⚙️'}
              </div>
              <div style={{ fontSize:'16px', color:'#6b6b80' }}>
                {active==='movies' ? 'Lista e filmave nga Supabase' : active==='users' ? 'Lista e userëve' : active==='settings' ? 'Cilësimet' : 'Dashboard'}
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div style={{ position:'fixed', bottom:'24px', right:'24px', background: toastError ? '#1f0d0d' : '#0d1f0d', border:`1px solid ${toastError ? 'rgba(255,107,107,0.4)' : 'rgba(34,197,94,0.4)'}`, color: toastError ? '#ff6b6b' : '#22c55e', padding:'12px 20px', borderRadius:'8px', fontSize:'13px', zIndex:9999, boxShadow:'0 4px 20px rgba(0,0,0,0.5)' }}>
          {toastError ? '✗ ' : '✓ '}{toast}
        </div>
      )}
    </div>
  )
}