'use client'
import { useState } from 'react'

const NAV = [
  { id:'dashboard', icon:'⊞', label:'Dashboard', badge:null },
  { section: 'Përmbajtja' },
  { id:'add', icon:'＋', label:'Shto Film', badge:null },
  { id:'movies', icon:'🎬', label:'Filmat', badge:'24' },
  { id:'subtitles', icon:'💬', label:'Titrat', badge:'18' },
  { section: 'Userat' },
  { id:'users', icon:'👥', label:'Të gjithë Userat', badge:'142' },
  { id:'blocked', icon:'🚫', label:'Bllokuar', badge:'3', badgeColor:'#ff6b6b' },
  { section: 'Monetizimi' },
  { id:'membership', icon:'⭐', label:'Membership', coming:true },
  { id:'ads', icon:'💰', label:'Reklamat & Affiliate', coming:true },
  { id:'analytics', icon:'📊', label:'Analitika', coming:true },
  { section: 'Sistemi' },
  { id:'settings', icon:'⚙', label:'Cilësimet', badge:null },
]

const USERS = [
  { name:'Ardit Kelmendi', email:'ardit.k@gmail.com', role:'free', date:'2025-05-15', watched:12 },
  { name:'Blerina Hoxha', email:'blerina.h@gmail.com', role:'vip', date:'2025-05-10', watched:48 },
  { name:'Genti Marku', email:'genti.m@gmail.com', role:'mod', date:'2025-04-20', watched:89 },
  { name:'Drita Shehu', email:'drita.s@yahoo.com', role:'free', date:'2025-05-18', watched:3 },
  { name:'Fation Laci', email:'fation.l@gmail.com', role:'vip', date:'2025-04-05', watched:67 },
  { name:'Mirela Çela', email:'mirela.c@gmail.com', role:'premium', date:'2025-03-12', watched:134 },
]

const MOVIES_LIST = [
  { title:'Inception', year:2010, genre:'Sci-Fi', sub:true, status:'live', img:'https://image.tmdb.org/t/p/w300/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg' },
  { title:'The Dark Knight', year:2008, genre:'Aksion', sub:true, status:'live', img:'https://image.tmdb.org/t/p/w300/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
  { title:'Interstellar', year:2014, genre:'Sci-Fi', sub:false, status:'draft', img:'https://image.tmdb.org/t/p/w300/gEU2QniE6E77NI6lCU6MxlNBvIE.jpg' },
  { title:'Oppenheimer', year:2023, genre:'Drama', sub:true, status:'live', img:'https://image.tmdb.org/t/p/w300/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg' },
  { title:'Furiosa', year:2024, genre:'Aksion', sub:true, status:'live', img:'https://image.tmdb.org/t/p/w300/iADOJ8Zymht2JPMoy3R7xceZprc.jpg' },
]

const ROLE_BADGE: Record<string,string> = {
  free:'#6b6b80', vip:'#f5a623', mod:'#3b82f6', premium:'#22c55e'
}

export default function AdminPage() {
  const [active, setActive] = useState('dashboard')
  const [toast, setToast] = useState('')
  const [videoSource, setVideoSource] = useState<'upload'|'link'>('upload')
  const [title, setTitle] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const s = (id: string) => ({
    background: active === id ? 'rgba(229,9,20,0.07)' : 'transparent',
    borderLeft: active === id ? '2px solid #e50914' : '2px solid transparent',
    color: active === id ? '#fff' : '#6b6b80',
  })

  return (
    <div style={{ display:'grid', gridTemplateColumns:'230px 1fr', minHeight:'100vh', fontFamily:"'DM Sans', sans-serif", background:'#0a0a0f', color:'#fff' }}>

      {/* SIDEBAR */}
      <div style={{ background:'#12121a', borderRight:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'22px', letterSpacing:'3px' }}>
            <span style={{ color:'#e50914' }}>C</span>INEAL
          </div>
          <div style={{ fontSize:'9px', background:'rgba(229,9,20,0.12)', border:'1px solid rgba(229,9,20,0.25)', color:'#ff6b6b', padding:'2px 8px', borderRadius:'10px', letterSpacing:'1px', display:'inline-block', marginTop:'4px' }}>
            Admin Panel
          </div>
        </div>

        <div style={{ flex:1, padding:'8px 0', overflowY:'auto' }}>
          {NAV.map((item, i) => {
            if ('section' in item) return (
              <div key={i} style={{ padding:'14px 20px 4px', fontSize:'10px', color:'#6b6b80', letterSpacing:'1.5px', textTransform:'uppercase' }}>{item.section}</div>
            )
            return (
              <div key={item.id} onClick={() => setActive(item.id!)}
                style={{ ...s(item.id!), display:'flex', alignItems:'center', gap:'10px', padding:'9px 20px', fontSize:'13px', cursor:'pointer', transition:'all 0.15s' }}>
                <span style={{ fontSize:'14px', width:'18px', textAlign:'center' }}>{item.icon}</span>
                <span style={{ flex:1 }}>{item.label}</span>
                {item.coming && <span style={{ fontSize:'9px', background:'rgba(245,166,35,0.1)', border:'1px solid rgba(245,166,35,0.2)', color:'#f5a623', padding:'1px 6px', borderRadius:'8px' }}>Së shpejti</span>}
                {item.badge && !item.coming && <span style={{ fontSize:'10px', background:'rgba(255,255,255,0.07)', color: item.badgeColor||'#6b6b80', padding:'1px 7px', borderRadius:'10px' }}>{item.badge}</span>}
              </div>
            )
          })}
        </div>

        <div style={{ padding:'14px 20px', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'rgba(229,9,20,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:500, color:'#ff6b6b', flexShrink:0 }}>A</div>
          <div><div style={{ fontSize:'13px', color:'#b0b0c0' }}>Admin</div><div style={{ fontSize:'10px', color:'#6b6b80' }}>Cineal Owner</div></div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Topbar */}
        <div style={{ padding:'14px 28px', borderBottom:'1px solid rgba(255,255,255,0.07)', background:'#12121a', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:'15px', fontWeight:500 }}>
              {{ dashboard:'Dashboard', add:'Shto Film të Ri', movies:'Menaxho Filmat', subtitles:'Titrat', users:'Menaxho Userat', blocked:'Userat e Bllokuar', membership:'Membership & Planetë', ads:'Reklamat & Affiliate', analytics:'Analitika', settings:'Cilësimet' }[active]}
            </div>
            <div style={{ fontSize:'12px', color:'#6b6b80', marginTop:'2px' }}>
              {{ dashboard:'Përmbledhja e platformës', add:'Ngarko film ose vendos link', movies:'Lista e plotë e filmave', subtitles:'Menaxho titrat shqip', users:'Shiko dhe menaxho të gjithë userat', blocked:'Userat e bllokuar', membership:'Konfiguro planet - aktivizo pas lansimit', ads:'AdSense dhe affiliate links', analytics:'Statistikat pas lansimit', settings:'Konfiguro Bunny.net dhe Supabase' }[active]}
            </div>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={() => setActive('add')} style={{ background:'#e50914', border:'none', color:'#fff', padding:'8px 18px', borderRadius:'5px', fontSize:'12px', fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>+ Shto Film</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding:'24px 28px', overflowY:'auto', flex:1 }}>

          {/* DASHBOARD */}
          {active === 'dashboard' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
                {[{l:'Filma Gjithsej',v:'24',s:'+3 këtë javë',c:'#22c55e'},{l:'Userat',v:'142',s:'+12 këtë muaj',c:'#22c55e'},{l:'Vizitorë Sot',v:'—',s:'Para lansimit',c:'#6b6b80'},{l:'Të ardhura',v:'—',s:'Aktivizo monetizimin',c:'#6b6b80'}].map((sc,i)=>(
                  <div key={i} style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'14px 16px' }}>
                    <div style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'6px' }}>{sc.l}</div>
                    <div style={{ fontSize:'24px', fontWeight:500 }}>{sc.v}</div>
                    <div style={{ fontSize:'11px', color:sc.c, marginTop:'5px' }}>{sc.s}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'16px' }}>
                  <div style={{ fontSize:'11px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'12px' }}>Aktiviteti i fundit</div>
                  {[['✓','#22c55e','User i ri — ardit.k','2 min'],['🎬','#3b82f6','Film i shtuar — Inception','1 orë'],['🚫','#f5a623','User bllokuar — spam123','3 orë'],['💬','#22c55e','Titra — Dune: Part Two','5 orë']].map(([dot,c,txt,t],i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ color:c as string, fontSize:'13px' }}>{dot}</span>
                      <span style={{ flex:1, fontSize:'12px', color:'#b0b0c0' }}>{txt}</span>
                      <span style={{ fontSize:'10px', color:'#6b6b80' }}>{t}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'16px' }}>
                  <div style={{ fontSize:'11px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:'12px' }}>Filmat më të parë</div>
                  {['Inception — 248','The Dark Knight — 201','Interstellar — 189','Furiosa — 143','Oppenheimer — 98'].map((m,i)=>(
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:'12px', color:'#b0b0c0' }}>
                      <span>{m.split('—')[0]}</span><span style={{ color:'#6b6b80' }}>{m.split('—')[1]} shikime</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ADD MOVIE */}
          {active === 'add' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'0.8px' }}>Titulli i Filmit *</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="p.sh. Inception" style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', color:'#fff', padding:'10px 14px', borderRadius:'5px', fontSize:'13px', fontFamily:"'DM Sans', sans-serif", outline:'none' }} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'0.8px' }}>Titulli Shqip (opsional)</label>
                <input placeholder="p.sh. Fillimi" style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', color:'#fff', padding:'10px 14px', borderRadius:'5px', fontSize:'13px', fontFamily:"'DM Sans', sans-serif", outline:'none' }} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'0.8px' }}>Viti</label>
                <input placeholder="2024" type="number" style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', color:'#fff', padding:'10px 14px', borderRadius:'5px', fontSize:'13px', fontFamily:"'DM Sans', sans-serif", outline:'none' }} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'0.8px' }}>Zhanri</label>
                <select style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', color:'#fff', padding:'10px 14px', borderRadius:'5px', fontSize:'13px', fontFamily:"'DM Sans', sans-serif", outline:'none' }}>
                  {['Aksion','Drama','Comedy','Sci-Fi','Thriller','Horror','Anime','Romance'].map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'0.8px' }}>Kohëzgjatja</label>
                <input placeholder="2h 28min" style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', color:'#fff', padding:'10px 14px', borderRadius:'5px', fontSize:'13px', fontFamily:"'DM Sans', sans-serif", outline:'none' }} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'0.8px' }}>Vlerësimi IMDb</label>
                <input placeholder="7.8" type="number" step="0.1" style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', color:'#fff', padding:'10px 14px', borderRadius:'5px', fontSize:'13px', fontFamily:"'DM Sans', sans-serif", outline:'none' }} />
              </div>
              <div style={{ gridColumn:'1/-1', display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'0.8px' }}>Përshkrimi Shqip</label>
                <textarea placeholder="Shkruaj përshkrimin..." rows={3} style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', color:'#fff', padding:'10px 14px', borderRadius:'5px', fontSize:'13px', fontFamily:"'DM Sans', sans-serif", outline:'none', resize:'vertical' }} />
              </div>

              {/* Video Source */}
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:'10px' }}>Burimi i Videos</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', overflow:'hidden', marginBottom:'12px' }}>
                  {(['upload','link'] as const).map(src=>(
                    <button key={src} onClick={()=>setVideoSource(src)} style={{ padding:'14px', textAlign:'center', fontSize:'13px', cursor:'pointer', fontFamily:"'DM Sans', sans-serif", border:'none', background: videoSource===src ? 'rgba(229,9,20,0.1)' : '#12121a', color: videoSource===src ? '#fff' : '#6b6b80', borderBottom: videoSource===src ? '2px solid #e50914' : '2px solid transparent' }}>
                      {src==='upload' ? '⬆ Ngarko nga PC' : '🔗 Vendos Link / URL'}
                    </button>
                  ))}
                </div>
                {videoSource==='upload' ? (
                  <div style={{ border:'1.5px dashed rgba(255,255,255,0.12)', borderRadius:'8px', padding:'28px', textAlign:'center', cursor:'pointer', background:'rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize:'24px', marginBottom:'8px' }}>🎬</div>
                    <div style={{ fontSize:'13px', color:'#b0b0c0', marginBottom:'4px', fontWeight:500 }}>Kliko për të ngarkuar videon nga PC</div>
                    <div style={{ fontSize:'11px', color:'#6b6b80' }}>MP4, MKV · Deri 50GB · Ngarkohet te Bunny.net</div>
                  </div>
                ) : (
                  <div style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'16px', display:'flex', flexDirection:'column', gap:'10px' }}>
                    {[{icon:'🐰',ph:'https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID',label:'Bunny.net'},{icon:'▶',ph:'https://youtube.com/watch?v=... (unlisted)',label:'YouTube'},{icon:'🔗',ph:'https://cdn.example.com/film.m3u8',label:'Direct URL'}].map(({icon,ph,label})=>(
                      <div key={label} style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                        <span style={{ fontSize:'16px', width:'28px', textAlign:'center' }}>{icon}</span>
                        <input placeholder={ph} style={{ flex:1, background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.07)', color:'#fff', padding:'9px 12px', borderRadius:'5px', fontSize:'12px', fontFamily:"'DM Sans', sans-serif", outline:'none' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Images & Subtitle */}
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'0.8px' }}>Titra Shqip (.srt / .vtt)</label>
                <div style={{ border:'1.5px dashed rgba(255,255,255,0.12)', borderRadius:'8px', padding:'20px', textAlign:'center', cursor:'pointer', background:'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize:'20px', marginBottom:'4px' }}>💬</div>
                  <div style={{ fontSize:'12px', color:'#b0b0c0', fontWeight:500 }}>Ngarko .srt / .vtt</div>
                  <div style={{ fontSize:'10px', color:'#6b6b80', marginTop:'2px' }}>ose vendos URL</div>
                </div>
                <input placeholder="https://.../subtitles-sq.vtt (opsional)" style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', color:'#fff', padding:'9px 12px', borderRadius:'5px', fontSize:'12px', fontFamily:"'DM Sans', sans-serif", outline:'none' }} />
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'0.8px' }}>Poster & Backdrop</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                  {[{icon:'🖼',label:'Poster (2:3)'},{icon:'🌄',label:'Backdrop (16:9)'}].map(({icon,label})=>(
                    <div key={label} style={{ border:'1.5px dashed rgba(255,255,255,0.1)', borderRadius:'6px', padding:'16px', textAlign:'center', cursor:'pointer', background:'rgba(255,255,255,0.02)' }}>
                      <div style={{ fontSize:'18px', marginBottom:'4px' }}>{icon}</div>
                      <div style={{ fontSize:'11px', color:'#6b6b80' }}>{label}</div>
                    </div>
                  ))}
                </div>
                <input placeholder="Poster URL (TMDB ose Bunny)" style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', color:'#fff', padding:'9px 12px', borderRadius:'5px', fontSize:'12px', fontFamily:"'DM Sans', sans-serif", outline:'none' }} />
                <input placeholder="Backdrop URL (TMDB ose Bunny)" style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', color:'#fff', padding:'9px 12px', borderRadius:'5px', fontSize:'12px', fontFamily:"'DM Sans', sans-serif", outline:'none' }} />
              </div>

              <div style={{ gridColumn:'1/-1', display:'flex', gap:'10px' }}>
                <button onClick={()=>{ if(title) showToast(`"${title}" u shtua me sukses!`) }} style={{ background:'#e50914', border:'none', color:'#fff', padding:'11px 24px', borderRadius:'5px', fontSize:'13px', fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>✓ Shto Filmin</button>
                <button style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)', color:'#b0b0c0', padding:'11px 18px', borderRadius:'5px', fontSize:'13px', cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>✕ Pastro</button>
              </div>
            </div>
          )}

          {/* MOVIES TABLE */}
          {active === 'movies' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px', gap:'10px' }}>
                <input placeholder="Kërko film..." style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', color:'#b0b0c0', padding:'8px 14px', borderRadius:'5px', fontSize:'12px', fontFamily:"'DM Sans', sans-serif", outline:'none', width:'240px' }} />
                <button onClick={()=>setActive('add')} style={{ background:'#e50914', border:'none', color:'#fff', padding:'8px 18px', borderRadius:'5px', fontSize:'12px', fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>+ Shto Film</button>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                  {['','Titulli','Viti','Zhanri','Titra','Statusi','Veprime'].map(h=><th key={h} style={{ textAlign:'left', padding:'9px 12px', fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:400 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {MOVIES_LIST.map((m,i)=>(
                    <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding:'11px 12px' }}><img src={m.img} alt={m.title} style={{ width:'32px', height:'46px', objectFit:'cover', borderRadius:'3px' }} /></td>
                      <td style={{ padding:'11px 12px', fontSize:'13px', fontWeight:500, color:'#fff' }}>{m.title}</td>
                      <td style={{ padding:'11px 12px', fontSize:'12px', color:'#b0b0c0' }}>{m.year}</td>
                      <td style={{ padding:'11px 12px', fontSize:'12px', color:'#b0b0c0' }}>{m.genre}</td>
                      <td style={{ padding:'11px 12px' }}><span style={{ background: m.sub ? 'rgba(34,197,94,0.1)' : 'rgba(245,166,35,0.1)', border: `1px solid ${m.sub ? 'rgba(34,197,94,0.2)' : 'rgba(245,166,35,0.2)'}`, color: m.sub ? '#22c55e' : '#f5a623', fontSize:'10px', padding:'2px 8px', borderRadius:'3px' }}>{m.sub ? '✓ Shqip' : 'Pa titra'}</span></td>
                      <td style={{ padding:'11px 12px' }}><span style={{ background: m.status==='live' ? 'rgba(34,197,94,0.1)' : 'rgba(245,166,35,0.1)', border: `1px solid ${m.status==='live' ? 'rgba(34,197,94,0.2)' : 'rgba(245,166,35,0.2)'}`, color: m.status==='live' ? '#22c55e' : '#f5a623', fontSize:'10px', padding:'2px 8px', borderRadius:'3px' }}>{m.status==='live' ? 'Live' : 'Draft'}</span></td>
                      <td style={{ padding:'11px 12px' }}><div style={{ display:'flex', gap:'5px' }}>
                        <button onClick={()=>showToast('Duke edituar...')} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'#b0b0c0', padding:'4px 9px', borderRadius:'3px', fontSize:'10px', cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>Edito</button>
                        <button onClick={()=>showToast('Film u fshi!')} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'#ff6b6b', padding:'4px 9px', borderRadius:'3px', fontSize:'10px', cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>Fshi</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* USERS */}
          {active === 'users' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px', gap:'10px', flexWrap:'wrap' }}>
                <input placeholder="Kërko user (emër, email)..." style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', color:'#b0b0c0', padding:'8px 14px', borderRadius:'5px', fontSize:'12px', fontFamily:"'DM Sans', sans-serif", outline:'none', width:'240px' }} />
                <div style={{ display:'flex', gap:'6px' }}>
                  {['Të gjithë','Free','VIP','Moderator'].map(f=>(
                    <button key={f} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'#b0b0c0', padding:'6px 12px', borderRadius:'20px', fontSize:'11px', cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>{f}</button>
                  ))}
                </div>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead><tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                  {['User','Email','Roli','U regjistrua','Filma parë','Veprime'].map(h=><th key={h} style={{ textAlign:'left', padding:'9px 12px', fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:400 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {USERS.map((u,i)=>(
                    <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding:'11px 12px' }}><div style={{ display:'flex', alignItems:'center', gap:'8px' }}><div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'#1a1a2e', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:500, color:'#b0b0c0', flexShrink:0 }}>{u.name[0]}</div><span style={{ fontSize:'13px', fontWeight:500, color:'#fff' }}>{u.name}</span></div></td>
                      <td style={{ padding:'11px 12px', fontSize:'12px', color:'#b0b0c0' }}>{u.email}</td>
                      <td style={{ padding:'11px 12px' }}><span style={{ background:`rgba(0,0,0,0.3)`, border:`1px solid ${ROLE_BADGE[u.role]}33`, color:ROLE_BADGE[u.role], fontSize:'10px', padding:'2px 9px', borderRadius:'3px', fontWeight:500 }}>{u.role.toUpperCase()}</span></td>
                      <td style={{ padding:'11px 12px', fontSize:'12px', color:'#b0b0c0' }}>{u.date}</td>
                      <td style={{ padding:'11px 12px', fontSize:'12px', color:'#b0b0c0' }}>{u.watched}</td>
                      <td style={{ padding:'11px 12px' }}><div style={{ display:'flex', gap:'5px' }}>
                        <button onClick={()=>showToast(`${u.name} → VIP!`)} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'#f5a623', padding:'4px 9px', borderRadius:'3px', fontSize:'10px', cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>VIP</button>
                        <button onClick={()=>showToast(`${u.name} u bllokua!`)} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'#ff6b6b', padding:'4px 9px', borderRadius:'3px', fontSize:'10px', cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>Blloko</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* MEMBERSHIP */}
          {active === 'membership' && (
            <div>
              <div style={{ background:'rgba(245,166,35,0.07)', border:'1px solid rgba(245,166,35,0.2)', borderRadius:'6px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
                <span style={{ fontSize:'16px' }}>⚠</span>
                <span style={{ fontSize:'12px', color:'#f5a623' }}>Membership është i çaktivizuar — aktivizo pasi të kesh traffic të mjaftueshëm.</span>
                <button onClick={()=>showToast('Membership u aktivizua!')} style={{ marginLeft:'auto', background:'#e50914', border:'none', color:'#fff', padding:'7px 16px', borderRadius:'5px', fontSize:'12px', cursor:'pointer', fontFamily:"'DM Sans', sans-serif", whiteSpace:'nowrap' }}>Aktivizo</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
                {[{n:'Free',p:'0',d:'Plani bazë',features:['Filma me reklama','Titra shqip','HD 720p'],off:['Pa reklama','Full HD','Watchlist']},{n:'VIP',p:'500 ALL',d:'Pa ndërprerje',features:['Pa reklama','Titra shqip','Full HD 1080p','Watchlist','Historik'],off:['Akses i hershëm'],popular:true},{n:'Premium',p:'1200 ALL',d:'Për fanatikët',features:['Gjithçka VIP','Akses i hershëm','4K','Download offline','Badge special'],off:[]}].map(pl=>(
                  <div key={pl.n} style={{ background:'#12121a', border:`1px solid ${pl.popular ? 'rgba(229,9,20,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius:'8px', padding:'18px', position:'relative' }}>
                    {pl.popular && <div style={{ position:'absolute', top:'-1px', right:'14px', background:'#e50914', color:'#fff', fontSize:'9px', padding:'2px 10px', borderRadius:'0 0 6px 6px', letterSpacing:'1px', fontWeight:500 }}>POPULAR</div>}
                    <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'18px', letterSpacing:'2px', color: pl.popular ? '#f5a623' : '#fff', marginBottom:'4px' }}>{pl.n}</div>
                    <div style={{ fontSize:'20px', fontWeight:500, marginBottom:'2px' }}>{pl.p} <span style={{ fontSize:'12px', color:'#6b6b80', fontWeight:400 }}>/ muaj</span></div>
                    <div style={{ fontSize:'11px', color:'#6b6b80', marginBottom:'14px' }}>{pl.d}</div>
                    {pl.features.map(f=><div key={f} style={{ fontSize:'12px', color:'#b0b0c0', display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px' }}><span style={{ color:'#22c55e' }}>✓</span>{f}</div>)}
                    {pl.off.map(f=><div key={f} style={{ fontSize:'12px', color:'#6b6b80', display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px', textDecoration:'line-through' }}><span>✗</span>{f}</div>)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {active === 'settings' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
              {[{l:'Emri i faqes',ph:'',val:'Cineal'},{l:'Domain',ph:'cineal.al',val:''},{l:'Bunny.net Library ID',ph:'123456',val:''},{l:'Bunny.net API Key',ph:'••••••••',val:'',pw:true},{l:'Pull Zone URL',ph:'https://cineal.b-cdn.net',val:''},{l:'Supabase URL',ph:'https://xxx.supabase.co',val:''},{l:'Supabase Anon Key',ph:'••••••••',val:'',pw:true},{l:'Google AdSense ID',ph:'ca-pub-XXXXXXXX',val:''}].map((f,i)=>(
                <div key={i} style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                  <label style={{ fontSize:'10px', color:'#6b6b80', textTransform:'uppercase', letterSpacing:'0.8px' }}>{f.l}</label>
                  <input defaultValue={f.val} placeholder={f.ph} type={f.pw ? 'password' : 'text'} style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', color:'#fff', padding:'9px 12px', borderRadius:'5px', fontSize:'12px', fontFamily:"'DM Sans', sans-serif", outline:'none' }} />
                </div>
              ))}
              <div style={{ gridColumn:'1/-1' }}>
                <button onClick={()=>showToast('Cilësimet u ruajtën!')} style={{ background:'#e50914', border:'none', color:'#fff', padding:'11px 24px', borderRadius:'5px', fontSize:'13px', fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>✓ Ruaj të gjitha cilësimet</button>
              </div>
            </div>
          )}

          {/* OTHER PANELS */}
          {['ads','analytics','subtitles','blocked'].includes(active) && (
            <div style={{ background:'#12121a', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', padding:'40px', textAlign:'center' }}>
              <div style={{ fontSize:'28px', marginBottom:'12px' }}>{{ ads:'💰', analytics:'📊', subtitles:'💬', blocked:'🚫' }[active]}</div>
              <div style={{ fontSize:'14px', fontWeight:500, marginBottom:'8px' }}>{{ ads:'Reklamat & Affiliate', analytics:'Analitika', subtitles:'Menaxhimi i Titrave', blocked:'Userat e Bllokuar' }[active]}</div>
              <div style={{ fontSize:'13px', color:'#6b6b80', marginBottom:'16px' }}>{{ ads:'Konfiguro AdSense ID dhe NordVPN affiliate links.', analytics:'Disponohet pas lansimit të faqes.', subtitles:'Titrat shtohen direkt kur shton filmin.', blocked:'Nuk ka userë të bllokuar aktualisht.' }[active]}</div>
            </div>
          )}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position:'fixed', bottom:'20px', right:'20px', background:'#0d1f0d', border:'1px solid rgba(34,197,94,0.3)', color:'#22c55e', padding:'10px 16px', borderRadius:'6px', fontSize:'12px', display:'flex', alignItems:'center', gap:'6px', zIndex:999 }}>
          ✓ {toast}
        </div>
      )}
    </div>
  )
}
