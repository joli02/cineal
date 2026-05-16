'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const NAV = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'add', icon: '+', label: 'Shto Film' },
  { id: 'add-kids', icon: '🧒', label: 'Shto Film Kids' },
  { id: 'movies', icon: '▶', label: 'Filmat' },
  { id: 'users', icon: '◉', label: 'Userat' },
  { id: 'titrat', icon: '◎', label: 'Titrat' },
  { id: 'settings', icon: '⚙', label: 'Cilësimet' },
]

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG = 'https://image.tmdb.org/t/p'

const GENRE_MAP: Record<number, string> = {
  28: 'Aksion', 12: 'Aksion', 16: 'Anime', 35: 'Comedy',
  80: 'Thriller', 99: 'Dokumentar', 18: 'Drama', 10751: 'Drama',
  14: 'Sci-Fi', 36: 'Drama', 27: 'Horror', 10402: 'Drama',
  9648: 'Thriller', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'Drama', 53: 'Thriller', 10752: 'Aksion', 37: 'Aksion'
}

const KIDS_CATEGORIES = [
  { id: '2-6', label: 'Për 2–6 Vjeç' },
  { id: '7plus', label: 'Për 7+' },
  { id: 'familje', label: 'Familje' },
]

const INP: React.CSSProperties = {
  background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)',
  color: '#fff', padding: '10px 14px', borderRadius: '5px',
  fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box',
  fontFamily: "'DM Sans', sans-serif",
}

// ─── VTT helpers ────────────────────────────────────────────────
function parseVTT(content: string) {
  const lines = content.split('\n')
  const blocks: string[][] = []
  let current: string[] = []
  for (const line of lines) {
    if (line.trim() === '' && current.length > 0) {
      blocks.push(current)
      current = []
    } else {
      current.push(line)
    }
  }
  if (current.length > 0) blocks.push(current)
  return blocks
}

function chunkBlocks(blocks: string[][], size = 50) {
  const chunks: string[][][] = []
  for (let i = 0; i < blocks.length; i += size) chunks.push(blocks.slice(i, i + size))
  return chunks
}

function blocksToText(blocks: string[][]) {
  return blocks.map(b => b.join('\n')).join('\n\n')
}

// ─── OpenAI translate ────────────────────────────────────────────
async function translateChunkOnce(chunk: string, context: string, apiKey: string): Promise<string> {
  const prompt = `Ti je përkthyes profesionist i titrave të filmit nga anglisht në shqip standarde. Ke përvojë të gjerë me filma dhe e njeh mirë kulturën shqiptare dhe angleze.

KONTEKSTI I FILMIT: ${context}

═══ RREGULLAT E FORMATIT (KRITIKE — MOS I SHKEL KURRË) ═══
1. MOS prek KURRË rreshtat me timestamp: (00:00:01.000 --> 00:00:03.000)
2. MOS prek KURRË numrat e bllokut (1, 2, 3...)
3. MOS prek KURRË rreshtat bosh midis bloqeve
4. Kthe VETËM VTT-në e përkthyer — zero komente, zero shpjegime

═══ RREGULLAT E GJUHËS ═══
5. Shprehjet idiomatike — ADAPTO, mos përkthe fjalë-për-fjalë
6. Slang dhe humor — ruaj tonin, adapto
7. Termet teknike dhe shkencorë — lëri anglisht nëse nuk kanë ekuivalent
8. Referencat kulturore — emra filmash, personazhesh, markash MOS i ndrysho
9. Dialog i shkurtër dhe dramatik — ruaj shkurtësinë
10. Personazhet dhe emrat MOS i ndrysho kurrë

VTT PER PERKTHIM:
${chunk}`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.3, max_tokens: 4000 }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'OpenAI error')
  return data.choices[0]?.message?.content || ''
}

async function translateChunk(chunk: string, context: string, apiKey: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await translateChunkOnce(chunk, context, apiKey)
      if (result.trim()) return result
      throw new Error('Rezultat bosh')
    } catch (e: any) {
      if (attempt === retries) throw e
      await new Promise(r => setTimeout(r, attempt * 2000))
    }
  }
  return chunk
}

// ─── TMDB Hook ───────────────────────────────────────────────────
function useTMDB() {
  const [tmdbQuery, setTmdbQuery] = useState('')
  const [tmdbResults, setTmdbResults] = useState<any[]>([])
  const [tmdbSearching, setTmdbSearching] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<any>(null)
  const searchTimer = useRef<any>(null)

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
  const [tmdbId, setTmdbId] = useState<number | null>(null)

  useEffect(() => {
    if (!tmdbQuery.trim() || tmdbQuery.length < 2) { setTmdbResults([]); return }
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => searchTMDB(tmdbQuery), 400)
    return () => clearTimeout(searchTimer.current)
  }, [tmdbQuery])

  async function searchTMDB(query: string) {
    setTmdbSearching(true)
    try {
      const res = await fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=en-US`)
      const data = await res.json()
      setTmdbResults(data.results?.slice(0, 6) || [])
    } catch { setTmdbResults([]) }
    setTmdbSearching(false)
  }

  async function selectTMDBMovie(movie: any, showToast: (m: string, e?: boolean) => void) {
    setTmdbSearching(true)
    setTmdbResults([])
    setTmdbQuery('')
    try {
      const res = await fetch(`${TMDB_BASE}/movie/${movie.id}?api_key=${TMDB_KEY}&language=en-US`)
      const d = await res.json()
      const genreId = d.genres?.[0]?.id
      const mins = d.runtime || 0
      const h = Math.floor(mins / 60), m = mins % 60
      setSelectedMovie(d)
      setTitle(d.title || '')
      setTitleSq(d.title || '')
      setYear(d.release_date?.split('-')[0] || '')
      setGenre(GENRE_MAP[genreId] || 'Drama')
      setDuration(h > 0 ? `${h}h ${m}min` : `${m}min`)
      setRating(d.vote_average ? d.vote_average.toFixed(1) : '')
      setDescription(d.overview || '')
      setPosterUrl(d.poster_path ? `${TMDB_IMG}/w500${d.poster_path}` : '')
      setBackdropUrl(d.backdrop_path ? `${TMDB_IMG}/original${d.backdrop_path}` : '')
      setTmdbId(d.id)
    } catch { showToast('Gabim me TMDB!', true) }
    setTmdbSearching(false)
  }

  function reset() {
    setTitle(''); setTitleSq(''); setYear(''); setGenre('Aksion')
    setDuration(''); setRating(''); setDescription(''); setVideoUrl('')
    setPosterUrl(''); setBackdropUrl(''); setSubtitleUrl('')
    setSelectedMovie(null); setTmdbId(null); setTmdbQuery('')
  }

  return {
    tmdbQuery, setTmdbQuery, tmdbResults, setTmdbResults,
    tmdbSearching, selectedMovie, setSelectedMovie, setTmdbId,
    selectTMDBMovie,
    title, setTitle, titleSq, setTitleSq,
    year, setYear, genre, setGenre,
    duration, setDuration, rating, setRating,
    description, setDescription, videoUrl, setVideoUrl,
    posterUrl, setPosterUrl, backdropUrl, setBackdropUrl,
    subtitleUrl, setSubtitleUrl, tmdbId, reset,
  }
}

// ─── TMDBSearchBlock — JASHTË AdminPage (FIX për focus bug) ─────
function TMDBSearchBlock({ hook, showToastFn }: { hook: ReturnType<typeof useTMDB>, showToastFn: (m: string, e?: boolean) => void }) {
  return (
    <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
      <div style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
        Kërko filmin — të dhënat plotësohen automatikisht
      </div>
      <div style={{ position: 'relative' }}>
        <input
          value={hook.tmdbQuery}
          onChange={e => hook.setTmdbQuery(e.target.value)}
          placeholder="Shkruaj emrin e filmit anglisht... (p.sh. Inception)"
          style={{ ...INP, paddingLeft: '40px' }}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#6b6b80' }}>
          {hook.tmdbSearching ? '⟳' : '⌕'}
        </span>
      </div>
      {hook.tmdbResults.length > 0 && (
        <div style={{ marginTop: '8px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
          {hook.tmdbResults.map((m, i) => (
            <div key={m.id} onClick={() => hook.selectTMDBMovie(m, showToastFn)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', cursor: 'pointer', borderBottom: i < hook.tmdbResults.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(229,9,20,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {m.poster_path
                ? <img src={`${TMDB_IMG}/w92${m.poster_path}`} alt={m.title} style={{ width: '32px', height: '48px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }} />
                : <div style={{ width: '32px', height: '48px', background: '#1a1a2e', borderRadius: '3px', flexShrink: 0 }} />}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{m.title}</div>
                <div style={{ fontSize: '11px', color: '#6b6b80' }}>{m.release_date?.split('-')[0]} · ⭐ {m.vote_average?.toFixed(1)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {hook.selectedMovie && (
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '10px 14px' }}>
          {hook.selectedMovie.poster_path && <img src={`${TMDB_IMG}/w92${hook.selectedMovie.poster_path}`} alt={hook.selectedMovie.title} style={{ width: '32px', height: '48px', objectFit: 'cover', borderRadius: '3px' }} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#22c55e' }}>{hook.selectedMovie.title}</div>
            <div style={{ fontSize: '11px', color: '#6b6b80' }}>Të dhënat u plotësuan automatikisht nga TMDB</div>
          </div>
          <button onClick={() => { hook.setSelectedMovie(null); hook.setTmdbId(null) }}
            style={{ background: 'none', border: 'none', color: '#6b6b80', cursor: 'pointer', fontSize: '16px' }}>✕</button>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export default function AdminPage() {
  const [active, setActive] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [toastErr, setToastErr] = useState(false)
  const [stats, setStats] = useState({ movies: 0, users: 0, views: 0, vipUsers: 0 })

  const add = useTMDB()
  const [isTrending, setIsTrending] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)

  const kids = useTMDB()
  const [kidsCategory, setKidsCategory] = useState<string[]>([])

  const [movies, setMovies] = useState<any[]>([])
  const [movieSearch, setMovieSearch] = useState('')
  const [editMovie, setEditMovie] = useState<any>(null)

  const [users, setUsers] = useState<any[]>([])
  const [userSearch, setUserSearch] = useState('')

  const [vttFile, setVttFile] = useState<File | null>(null)
  const [vttContext, setVttContext] = useState('')
  const [vttApiKey, setVttApiKey] = useState('')
  const [vttProgress, setVttProgress] = useState(0)
  const [vttTotal, setVttTotal] = useState(0)
  const [vttStatus, setVttStatus] = useState('')
  const [vttResult, setVttResult] = useState('')
  const [vttTranslating, setVttTranslating] = useState(false)
  const [vttFileName, setVttFileName] = useState('')
  const [vttUploading, setVttUploading] = useState(false)
  const [vttUploadedUrl, setVttUploadedUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [maintenance, setMaintenance] = useState(false)
  const [siteTitle, setSiteTitle] = useState('Cineal — Filma me Titra Shqip')
  const [contactEmail, setContactEmail] = useState('info@cineal.stream')

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
    const { data: vipData } = await supabase.from('profiles').select('id').eq('role', 'vip')
    setStats({ movies: mc || 0, users: uc || 0, views: totalViews, vipUsers: vipData?.length || 0 })
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

  const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const handleAdd = async () => {
    if (!add.title.trim()) { showToast('Titulli është i detyrueshëm!', true); return }
    if (!add.videoUrl.trim()) { showToast('Video URL është e detyrueshme!', true); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('movies').insert({
        title: add.title.trim(), title_sq: add.titleSq.trim() || add.title.trim(),
        slug: slugify(add.title), year: add.year ? parseInt(add.year) : null,
        genre: add.genre, duration: add.duration || null,
        rating: add.rating ? parseFloat(add.rating) : null,
        description: add.description || null, video_url: add.videoUrl.trim(),
        poster_url: add.posterUrl || null, backdrop_url: add.backdropUrl || null,
        subtitle_url: add.subtitleUrl || null, is_trending: isTrending,
        is_featured: isFeatured, status: 'live', views: 0, tmdb_id: add.tmdbId,
        is_kids: false,
      })
      if (error) throw error
      showToast(`"${add.title}" u shtua me sukses!`)
      add.reset(); setIsTrending(false); setIsFeatured(false); fetchStats()
    } catch (e: any) { showToast(e.message, true) }
    setLoading(false)
  }

  const handleAddKids = async () => {
    if (!kids.title.trim()) { showToast('Titulli është i detyrueshëm!', true); return }
    if (!kids.videoUrl.trim()) { showToast('Video URL është e detyrueshme!', true); return }
    if (kidsCategory.length === 0) { showToast('Zgjidh të paktën një kategori!', true); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('movies').insert({
        title: kids.title.trim(), title_sq: kids.titleSq.trim() || kids.title.trim(),
        slug: slugify(kids.title), year: kids.year ? parseInt(kids.year) : null,
        genre: kids.genre, duration: kids.duration || null,
        rating: kids.rating ? parseFloat(kids.rating) : null,
        description: kids.description || null, video_url: kids.videoUrl.trim(),
        poster_url: kids.posterUrl || null, backdrop_url: kids.backdropUrl || null,
        subtitle_url: kids.subtitleUrl || null,
        is_trending: false, is_featured: false,
        status: 'live', views: 0, tmdb_id: kids.tmdbId,
        is_kids: true,
        kids_category: kidsCategory[0],
        kids_categories: kidsCategory,
      })
      if (error) throw error
      showToast(`"${kids.title}" u shtua te Kids me sukses!`)
      kids.reset(); setKidsCategory([]); fetchStats()
    } catch (e: any) { showToast(e.message, true) }
    setLoading(false)
  }

  const handleDelete = async (id: string, t: string) => {
    if (!confirm(`Fshi "${t}"?`)) return
    await supabase.from('movies').delete().eq('id', id)
    showToast(`"${t}" u fshi!`)
    fetchMovies(); fetchStats()
  }

  // ── NDRYSHIM 1: handleSaveEdit — shtohen description, is_filma_shqip, is_old_movies ──
  const handleSaveEdit = async () => {
    if (!editMovie) return
    setLoading(true)
    try {
      const { error } = await supabase.from('movies').update({
        title: editMovie.title, title_sq: editMovie.title_sq,
        year: editMovie.year, genre: editMovie.genre,
        duration: editMovie.duration, rating: editMovie.rating,
        description: editMovie.description,
        video_url: editMovie.video_url,
        poster_url: editMovie.poster_url, backdrop_url: editMovie.backdrop_url,
        subtitle_url: editMovie.subtitle_url, is_trending: editMovie.is_trending,
        status: editMovie.status,
        is_filma_shqip: editMovie.is_filma_shqip ?? false,
        is_old_movies: editMovie.is_old_movies ?? false,
      }).eq('id', editMovie.id)
      if (error) throw error
      showToast('Film u përditësua!')
      setEditMovie(null); fetchMovies()
    } catch (e: any) { showToast(e.message, true) }
    setLoading(false)
  }

  const handleSetVip = async (userId: string, days: number) => {
    const expires = new Date()
    expires.setDate(expires.getDate() + days)
    await supabase.from('profiles').update({ role: 'vip', vip_expires_at: expires.toISOString() }).eq('id', userId)
    showToast(`VIP aktivizuar për ${days} ditë!`)
    fetchUsers(); fetchStats()
  }

  const handleRemoveVip = async (userId: string) => {
    await supabase.from('profiles').update({ role: 'free', vip_expires_at: null }).eq('id', userId)
    showToast('VIP u hoq!')
    fetchUsers(); fetchStats()
  }

  const handleBlock = async (userId: string, status: string) => {
    const newStatus = status === 'blocked' ? 'active' : 'blocked'
    await supabase.from('profiles').update({ status: newStatus }).eq('id', userId)
    showToast(newStatus === 'blocked' ? 'User u bllokua!' : 'User u aktivizua!')
    fetchUsers()
  }

  const handleTranslate = async () => {
    if (!vttFile) { showToast('Ngarko skedarin .vtt!', true); return }
    if (!vttApiKey.trim()) { showToast('Shto OpenAI API Key!', true); return }
    if (!vttContext.trim()) { showToast('Shto kontekstin e filmit!', true); return }

    setVttTranslating(true)
    setVttResult('')
    setVttProgress(0)
    setVttStatus('Duke lexuar skedarin...')

    try {
      const text = await vttFile.text()
      const blocks = parseVTT(text)
      const contentBlocks = blocks.filter(b => !b[0]?.startsWith('WEBVTT'))
      const chunks = chunkBlocks(contentBlocks, 50)
      setVttTotal(chunks.length)
      setVttStatus(`Duke ndarë në ${chunks.length} copa...`)

      const translatedChunks: string[] = []
      for (let i = 0; i < chunks.length; i++) {
        setVttProgress(i + 1)
        setVttStatus(`Duke përkthyer copën ${i + 1} nga ${chunks.length}...`)
        const chunkText = blocksToText(chunks[i])
        try {
          const translated = await translateChunk(chunkText, vttContext, vttApiKey.trim())
          translatedChunks.push(translated.trim())
        } catch { translatedChunks.push(chunkText) }
        if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 500))
      }

      const finalVtt = 'WEBVTT\n\n' + translatedChunks.join('\n\n')
      setVttResult(finalVtt)
      setVttStatus('Perkthimi përfundoi!')
      showToast('Titrat u përkthyen me sukses!')

      setVttUploading(true)
      setVttUploadedUrl('')
      try {
        const autoFileName = vttFileName ? vttFileName.replace(/\.(vtt|srt)$/i, '-sq.vtt') : 'titrat-sq.vtt'
        const autoBlob = new Blob([finalVtt], { type: 'text/vtt' })
        const autoRes = await fetch(`/api/bunny-upload?filename=${encodeURIComponent(autoFileName)}`, {
          method: 'POST', body: autoBlob, headers: { 'Content-Type': 'text/vtt' },
        })
        const autoData = await autoRes.json()
        if (!autoRes.ok) throw new Error(autoData.error || 'Upload dështoi')
        setVttUploadedUrl(autoData.url)
        showToast('Titrat u ngarkuan te Bunny CDN!')
      } catch (e: any) { showToast('Upload dështoi: ' + e.message, true) }
      setVttUploading(false)
    } catch (e: any) {
      showToast(e.message || 'Gabim gjatë perkthimit!', true)
      setVttStatus('Gabim!')
    }
    setVttTranslating(false)
  }

  const handleDownloadVtt = () => {
    if (!vttResult) return
    const blob = new Blob([vttResult], { type: 'text/vtt' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = vttFileName ? vttFileName.replace('.vtt', '-sq.vtt') : 'titrat-sq.vtt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleUploadToBunny = async () => {
    if (!vttResult) return
    setVttUploading(true)
    setVttUploadedUrl('')
    try {
      const fileName = vttFileName ? vttFileName.replace(/\.(vtt|srt)$/i, '-sq.vtt') : 'titrat-sq.vtt'
      const blob = new Blob([vttResult], { type: 'text/vtt' })
      const res = await fetch(`/api/bunny-upload?filename=${encodeURIComponent(fileName)}`, {
        method: 'POST', body: blob, headers: { 'Content-Type': 'text/vtt' },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload dështoi')
      setVttUploadedUrl(data.url)
      showToast('Titrat u ngarkuan te Bunny CDN!')
    } catch (e: any) { showToast(e.message || 'Gabim gjatë ngarkimit!', true) }
    setVttUploading(false)
  }

  const filteredMovies = movies.filter(m =>
    m.title?.toLowerCase().includes(movieSearch.toLowerCase()) ||
    m.genre?.toLowerCase().includes(movieSearch.toLowerCase()) ||
    String(m.year || '').includes(movieSearch)
  )

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(userSearch.toLowerCase())
  )

  const getRoleLabel = (u: any) => {
    if (u.role === 'admin') return 'ADMIN'
    if (u.role === 'vip') return 'VIP'
    return 'FREE'
  }

  const getRoleStyle = (u: any) => {
    const r = getRoleLabel(u)
    if (r === 'ADMIN') return { background: 'rgba(229,9,20,0.12)', color: '#e50914' }
    if (r === 'VIP') return { background: 'rgba(245,166,35,0.12)', color: '#f5a623' }
    return { background: 'rgba(255,255,255,0.05)', color: '#6b6b80' }
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
              <span style={{ opacity: 0.7, fontSize: '13px' }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.id === 'add-kids' && (
                <span style={{ fontSize: '9px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', padding: '1px 6px', borderRadius: '8px', marginLeft: 'auto' }}>Kids</span>
              )}
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
          <div style={{ fontSize: '15px', fontWeight: 500 }}>{NAV.find(n => n.id === active)?.label}</div>
          <button onClick={() => setActive('add')}
            style={{ background: '#e50914', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>
            + Shto Film
          </button>
        </div>

        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>

          {/* ═══ DASHBOARD ═══ */}
          {active === 'dashboard' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                  { label: 'Filma Gjithsej', value: stats.movies, color: '#3b82f6' },
                  { label: 'Userat', value: stats.users, color: '#22c55e' },
                  { label: 'Shikime Totale', value: stats.views, color: '#f5a623' },
                  { label: 'Userat VIP', value: stats.vipUsers, color: '#e50914' },
                ].map((sc, i) => (
                  <div key={i} style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '18px' }}>
                    <div style={{ fontSize: '26px', fontWeight: 700, color: sc.color }}>{sc.value}</div>
                    <div style={{ fontSize: '11px', color: '#6b6b80', marginTop: '4px' }}>{sc.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Filmat e Fundit</div>
                  {movies.slice(0, 5).map((m: any) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {m.poster_url && <img src={m.poster_url} alt={m.title} style={{ width: '28px', height: '40px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }} />}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>{m.title}</div>
                        <div style={{ fontSize: '11px', color: '#6b6b80' }}>
                          {m.year} · {m.genre}
                          {m.is_kids && <span style={{ marginLeft: '6px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', fontSize: '10px', padding: '1px 5px', borderRadius: '3px' }}>Kids</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Userat e Fundit</div>
                  {users.slice(0, 5).map((u: any) => (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#b0b0c0', flexShrink: 0 }}>
                        {u.email?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                        <span style={{ ...getRoleStyle(u), fontSize: '10px', padding: '1px 6px', borderRadius: '3px' }}>{getRoleLabel(u)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ SHTO FILM ═══ */}
          {active === 'add' && (
            <div style={{ maxWidth: '900px' }}>
              <TMDBSearchBlock hook={add} showToastFn={showToast} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { label: 'Titulli * (anglisht)', val: add.title, set: add.setTitle, ph: 'Inception' },
                  { label: 'Titulli Shqip', val: add.titleSq, set: add.setTitleSq, ph: 'Fillimi' },
                  { label: 'Viti', val: add.year, set: add.setYear, ph: '2025', type: 'number' },
                  { label: 'Kohëzgjatja', val: add.duration, set: add.setDuration, ph: '2h 14min' },
                  { label: 'Rating IMDb', val: add.rating, set: add.setRating, ph: '7.5', type: 'number' },
                ].map(({ label, val, set, ph, type }) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</label>
                    <input value={val} onChange={e => set(e.target.value)} placeholder={ph} type={type || 'text'} style={INP} />
                  </div>
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Zhanri</label>
                  <select value={add.genre} onChange={e => add.setGenre(e.target.value)} style={INP}>
                    {['Aksion', 'Drama', 'Comedy', 'Sci-Fi', 'Thriller', 'Horror', 'Anime', 'Romance', 'Dokumentar'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Përshkrimi</label>
                  <textarea value={add.description} onChange={e => add.setDescription(e.target.value)} placeholder="Përshkrimi shqip..." rows={3} style={{ ...INP, resize: 'vertical' }} />
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '10px', color: '#e50914', textTransform: 'uppercase', letterSpacing: '1px' }}>Video URL * — nga Bunny.net</label>
                  <input value={add.videoUrl} onChange={e => add.setVideoUrl(e.target.value)}
                    placeholder="https://iframe.mediadelivery.net/embed/647882/VIDEO_ID?captions=sq"
                    style={{ ...INP, borderColor: 'rgba(229,9,20,0.3)' }} />
                  <span style={{ fontSize: '11px', color: '#6b6b80' }}>Bunny.net → Stream → Library → kopjo Video ID</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Poster URL {add.selectedMovie && <span style={{ color: '#22c55e' }}>✓ TMDB</span>}
                  </label>
                  <input value={add.posterUrl} onChange={e => add.setPosterUrl(e.target.value)} placeholder="https://image.tmdb.org/t/p/w500/..." style={INP} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Backdrop URL {add.selectedMovie && <span style={{ color: '#22c55e' }}>✓ TMDB</span>}
                  </label>
                  <input value={add.backdropUrl} onChange={e => add.setBackdropUrl(e.target.value)} placeholder="https://image.tmdb.org/t/p/original/..." style={INP} />
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Titra URL (.vtt) — opsionale</label>
                  <input value={add.subtitleUrl} onChange={e => add.setSubtitleUrl(e.target.value)} placeholder="https://cinealsubtitles.b-cdn.net/film-sq.vtt" style={INP} />
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#b0b0c0' }}>
                    <input type="checkbox" checked={isTrending} onChange={e => setIsTrending(e.target.checked)} style={{ accentColor: '#e50914', width: '16px', height: '16px' }} />
                    Trending
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#b0b0c0' }}>
                    <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ accentColor: '#e50914', width: '16px', height: '16px' }} />
                    Featured Hero
                  </label>
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px' }}>
                  <button onClick={handleAdd} disabled={loading}
                    style={{ background: loading ? '#444' : '#e50914', border: 'none', color: '#fff', padding: '12px 28px', borderRadius: '5px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Duke shtuar...' : 'Shto Filmin'}
                  </button>
                  <button onClick={() => { add.reset(); setIsTrending(false); setIsFeatured(false) }}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#b0b0c0', padding: '12px 20px', borderRadius: '5px', fontSize: '13px', cursor: 'pointer' }}>
                    Pastro
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ SHTO FILM KIDS ═══ */}
          {active === 'add-kids' && (
            <div style={{ maxWidth: '900px' }}>
              <div style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>🧒</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#3b82f6' }}>Seksioni Kids</div>
                  <div style={{ fontSize: '11px', color: '#6b6b80', marginTop: '2px' }}>
                    Filmat e shtuar këtu do të shfaqen <strong style={{ color: '#b0b0c0' }}>vetëm te seksioni Kids</strong>.
                  </div>
                </div>
              </div>
              <TMDBSearchBlock hook={kids} showToastFn={showToast} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { label: 'Titulli * (anglisht)', val: kids.title, set: kids.setTitle, ph: 'The Lion King' },
                  { label: 'Titulli Shqip', val: kids.titleSq, set: kids.setTitleSq, ph: 'Mbreti Luan' },
                  { label: 'Viti', val: kids.year, set: kids.setYear, ph: '2024', type: 'number' },
                  { label: 'Kohëzgjatja', val: kids.duration, set: kids.setDuration, ph: '1h 30min' },
                  { label: 'Rating IMDb', val: kids.rating, set: kids.setRating, ph: '7.5', type: 'number' },
                ].map(({ label, val, set, ph, type }) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</label>
                    <input value={val} onChange={e => set(e.target.value)} placeholder={ph} type={type || 'text'} style={INP} />
                  </div>
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Zhanri</label>
                  <select value={kids.genre} onChange={e => kids.setGenre(e.target.value)} style={INP}>
                    {['Animacion', 'Aventurë', 'Comedy', 'Drama', 'Familje', 'Fantazi', 'Aksion'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Përshkrimi</label>
                  <textarea value={kids.description} onChange={e => kids.setDescription(e.target.value)} placeholder="Përshkrimi shqip..." rows={3} style={{ ...INP, resize: 'vertical' }} />
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '10px', color: '#e50914', textTransform: 'uppercase', letterSpacing: '1px' }}>Video URL * — nga Bunny.net</label>
                  <input value={kids.videoUrl} onChange={e => kids.setVideoUrl(e.target.value)}
                    placeholder="https://iframe.mediadelivery.net/embed/647882/VIDEO_ID?captions=sq"
                    style={{ ...INP, borderColor: 'rgba(229,9,20,0.3)' }} />
                  <span style={{ fontSize: '11px', color: '#6b6b80' }}>Bunny.net → Stream → Library → kopjo Video ID</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Poster URL {kids.selectedMovie && <span style={{ color: '#22c55e' }}>✓ TMDB</span>}
                  </label>
                  <input value={kids.posterUrl} onChange={e => kids.setPosterUrl(e.target.value)} placeholder="https://image.tmdb.org/t/p/w500/..." style={INP} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Backdrop URL {kids.selectedMovie && <span style={{ color: '#22c55e' }}>✓ TMDB</span>}
                  </label>
                  <input value={kids.backdropUrl} onChange={e => kids.setBackdropUrl(e.target.value)} placeholder="https://image.tmdb.org/t/p/original/..." style={INP} />
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Titra URL (.vtt) — opsionale</label>
                  <input value={kids.subtitleUrl} onChange={e => kids.setSubtitleUrl(e.target.value)} placeholder="https://cinealsubtitles.b-cdn.net/film-sq.vtt" style={INP} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <div style={{ background: '#12121a', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', padding: '18px' }}>
                    <div style={{ fontSize: '11px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                      Kategoria Kids * — zgjidhni të paktën një
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {KIDS_CATEGORIES.map(cat => {
                        const isSelected = kidsCategory.includes(cat.id)
                        return (
                          <label key={cat.id}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 18px', borderRadius: '8px', border: `1px solid ${isSelected ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)'}`, background: isSelected ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)', transition: 'all 0.15s' }}>
                            <input type="checkbox" checked={isSelected}
                              onChange={e => {
                                if (e.target.checked) setKidsCategory(prev => [...prev, cat.id])
                                else setKidsCategory(prev => prev.filter(c => c !== cat.id))
                              }}
                              style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }} />
                            <span style={{ fontSize: '13px', fontWeight: 500, color: isSelected ? '#3b82f6' : '#b0b0c0' }}>{cat.label}</span>
                          </label>
                        )
                      })}
                    </div>
                    {kidsCategory.length === 0 && (
                      <div style={{ fontSize: '11px', color: '#f5a623', marginTop: '10px' }}>⚠ Zgjidh të paktën një kategori</div>
                    )}
                  </div>
                </div>
                <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px' }}>
                  <button onClick={handleAddKids} disabled={loading}
                    style={{ background: loading ? '#444' : '#3b82f6', border: 'none', color: '#fff', padding: '12px 28px', borderRadius: '5px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Duke shtuar...' : '🧒 Shto Film Kids'}
                  </button>
                  <button onClick={() => { kids.reset(); setKidsCategory([]) }}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#b0b0c0', padding: '12px 20px', borderRadius: '5px', fontSize: '13px', cursor: 'pointer' }}>
                    Pastro
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══ MOVIES ═══ */}
          {active === 'movies' && (
            <div>
              <div style={{ marginBottom: '16px', position: 'relative', display: 'inline-block' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b6b80', fontSize: '15px', pointerEvents: 'none' }}>⌕</span>
                <input value={movieSearch} onChange={e => setMovieSearch(e.target.value)}
                  placeholder="Kërko film, zhanër, vit..." style={{ ...INP, width: '280px', paddingLeft: '36px' }} />
              </div>

              {/* ── NDRYSHIM 2: Formulari i editimit — shtohen Përshkrimi + Filma Shqip + Old Movies ── */}
              {editMovie && (
                <div style={{ background: '#12121a', border: '1px solid rgba(229,9,20,0.3)', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '16px', color: '#e50914' }}>Po edito: {editMovie.title}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

                    {/* Fushat input standarde */}
                    {[
                      { label: 'Titulli', key: 'title' }, { label: 'Titulli Shqip', key: 'title_sq' },
                      { label: 'Viti', key: 'year' }, { label: 'Rating', key: 'rating' },
                      { label: 'Kohëzgjatja', key: 'duration' }, { label: 'Zhanri', key: 'genre' },
                      { label: 'Video URL', key: 'video_url' }, { label: 'Poster URL', key: 'poster_url' },
                      { label: 'Backdrop URL', key: 'backdrop_url' }, { label: 'Titra URL', key: 'subtitle_url' },
                    ].map(({ label, key }) => (
                      <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase' }}>{label}</label>
                        <input value={editMovie[key] || ''} onChange={e => setEditMovie({ ...editMovie, [key]: e.target.value })} style={INP} />
                      </div>
                    ))}

                    {/* Përshkrimi — textarea me gjerësi të plotë */}
                    <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase' }}>Përshkrimi</label>
                      <textarea
                        value={editMovie.description || ''}
                        onChange={e => setEditMovie({ ...editMovie, description: e.target.value })}
                        rows={3}
                        style={{ ...INP, resize: 'vertical' }}
                      />
                    </div>

                    {/* Checkboxat: Trending, Live, Filma Shqip, Old Movies */}
                    <div style={{ gridColumn: '1/-1', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#b0b0c0', cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!editMovie.is_trending} onChange={e => setEditMovie({ ...editMovie, is_trending: e.target.checked })} style={{ accentColor: '#e50914', width: '15px', height: '15px' }} />
                        Trending
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#b0b0c0', cursor: 'pointer' }}>
                        <input type="checkbox" checked={editMovie.status === 'live'} onChange={e => setEditMovie({ ...editMovie, status: e.target.checked ? 'live' : 'draft' })} style={{ accentColor: '#22c55e', width: '15px', height: '15px' }} />
                        Live
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#f5a623', cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!editMovie.is_filma_shqip} onChange={e => setEditMovie({ ...editMovie, is_filma_shqip: e.target.checked })} style={{ accentColor: '#f5a623', width: '15px', height: '15px' }} />
                        Filma Shqip
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#a855f7', cursor: 'pointer' }}>
                        <input type="checkbox" checked={!!editMovie.is_old_movies} onChange={e => setEditMovie({ ...editMovie, is_old_movies: e.target.checked })} style={{ accentColor: '#a855f7', width: '15px', height: '15px' }} />
                        Old Movies
                      </label>
                    </div>

                    {/* Butonat */}
                    <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px' }}>
                      <button onClick={handleSaveEdit} disabled={loading}
                        style={{ background: '#22c55e', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '5px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                        Ruaj ndryshimet
                      </button>
                      <button onClick={() => setEditMovie(null)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#b0b0c0', padding: '10px 16px', borderRadius: '5px', fontSize: '13px', cursor: 'pointer' }}>
                        Anulo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ fontSize: '11px', color: '#6b6b80', marginBottom: '10px' }}>
                {filteredMovies.length} filma{movieSearch ? ` — rezultate për "${movieSearch}"` : ''}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['', 'Titulli', 'Viti', 'Zhanri', 'Tip', 'Shikime', 'Status', 'Veprime'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '9px 12px', fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMovies.map((m: any) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 12px' }}>
                        {m.poster_url && <img src={m.poster_url} alt={m.title} style={{ width: '28px', height: '40px', objectFit: 'cover', borderRadius: '3px' }} />}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 500 }}>{m.title}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#b0b0c0' }}>{m.year}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#b0b0c0' }}>{m.genre}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {m.is_kids
                          ? <span style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6', fontSize: '10px', padding: '2px 8px', borderRadius: '3px', border: '1px solid rgba(59,130,246,0.3)' }}>Kids</span>
                          : m.is_filma_shqip
                          ? <span style={{ background: 'rgba(245,166,35,0.12)', color: '#f5a623', fontSize: '10px', padding: '2px 8px', borderRadius: '3px', border: '1px solid rgba(245,166,35,0.3)' }}>🇦🇱 Shqip</span>
                          : m.is_old_movies
                          ? <span style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', fontSize: '10px', padding: '2px 8px', borderRadius: '3px', border: '1px solid rgba(168,85,247,0.3)' }}>Old</span>
                          : <span style={{ background: 'rgba(255,255,255,0.05)', color: '#6b6b80', fontSize: '10px', padding: '2px 8px', borderRadius: '3px' }}>Normal</span>}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#b0b0c0' }}>{m.views || 0}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: m.status === 'live' ? 'rgba(34,197,94,0.1)' : 'rgba(245,166,35,0.1)', color: m.status === 'live' ? '#22c55e' : '#f5a623', fontSize: '11px', padding: '2px 8px', borderRadius: '3px', border: `1px solid ${m.status === 'live' ? 'rgba(34,197,94,0.3)' : 'rgba(245,166,35,0.3)'}` }}>
                          {m.status === 'live' ? 'Live' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => { setEditMovie(m); window.scrollTo(0, 0) }}
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

          {/* ═══ USERS ═══ */}
          {active === 'users' && (
            <div>
              <div style={{ marginBottom: '16px', position: 'relative', display: 'inline-block' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b6b80', fontSize: '15px', pointerEvents: 'none' }}>⌕</span>
                <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  placeholder="Kërko email, rol..." style={{ ...INP, width: '280px', paddingLeft: '36px' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#6b6b80', marginBottom: '10px' }}>
                {filteredUsers.length} usera · {stats.vipUsers} VIP
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['Email', 'Roli', 'VIP Skadon', 'Statusi', 'Veprime'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '9px 12px', fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u: any) => {
                    const roleLabel = getRoleLabel(u)
                    const rs = getRoleStyle(u)
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px', fontSize: '13px' }}>{u.email}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ ...rs, fontSize: '11px', padding: '2px 8px', borderRadius: '3px', fontWeight: 500 }}>{roleLabel}</span>
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
                            {roleLabel !== 'ADMIN' && (
                              <>
                                {u.role !== 'vip' ? (
                                  [{ label: '1 Muaj', days: 30 }, { label: '6 Muaj', days: 180 }, { label: '1 Vit', days: 365 }].map(({ label, days }) => (
                                    <button key={days} onClick={() => handleSetVip(u.id, days)}
                                      style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', color: '#f5a623', padding: '4px 8px', borderRadius: '3px', fontSize: '10px', cursor: 'pointer' }}>
                                      VIP {label}
                                    </button>
                                  ))
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
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ═══ TITRAT ═══ */}
          {active === 'titrat' && (
            <div style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px' }}>
                <div style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>OpenAI API Key</div>
                <input type="password" value={vttApiKey} onChange={e => setVttApiKey(e.target.value)} placeholder="sk-..." style={INP} />
                <div style={{ fontSize: '11px', color: '#6b6b80', marginTop: '6px' }}>Nuk ruhet — vetëm për këtë sesion</div>
              </div>
              <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px' }}>
                <div style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Skedari .vtt anglisht</div>
                <input ref={fileInputRef} type="file" accept=".vtt,.srt" style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) { setVttFile(f); setVttFileName(f.name); setVttResult('') }
                  }} />
                <div onClick={() => fileInputRef.current?.click()}
                  style={{ border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '8px', padding: '28px', textAlign: 'center', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(229,9,20,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}>
                  {vttFile ? (
                    <div>
                      <div style={{ fontSize: '20px', marginBottom: '6px' }}>✓</div>
                      <div style={{ fontSize: '13px', color: '#22c55e', fontWeight: 500 }}>{vttFileName}</div>
                      <div style={{ fontSize: '11px', color: '#6b6b80', marginTop: '4px' }}>Kliko për të ndryshuar</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.4 }}>↑</div>
                      <div style={{ fontSize: '13px', color: '#b0b0c0' }}>Kliko për të ngarkuar .vtt</div>
                      <div style={{ fontSize: '11px', color: '#6b6b80', marginTop: '4px' }}>Mbështet .vtt dhe .srt</div>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px' }}>
                <div style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Konteksti i filmit</div>
                <textarea value={vttContext} onChange={e => setVttContext(e.target.value)}
                  placeholder="Shembull: Film aksion 'Inception' (2010) me Leonardo DiCaprio..."
                  rows={4} style={{ ...INP, resize: 'vertical' }} />
                <div style={{ fontSize: '11px', color: '#6b6b80', marginTop: '6px' }}>Sa më shumë kontekst, aq më i mirë perkthimi</div>
              </div>
              <button onClick={handleTranslate} disabled={vttTranslating || !vttFile || !vttApiKey || !vttContext}
                style={{ background: vttTranslating || !vttFile || !vttApiKey || !vttContext ? '#2a2a3a' : '#e50914', border: 'none', color: vttTranslating || !vttFile || !vttApiKey || !vttContext ? '#6b6b80' : '#fff', padding: '14px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: vttTranslating || !vttFile || !vttApiKey || !vttContext ? 'not-allowed' : 'pointer', width: '100%' }}>
                {vttTranslating ? 'Duke përkthyer...' : 'Përktho në Shqip'}
              </button>
              {vttTranslating && (
                <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#b0b0c0' }}>{vttStatus}</span>
                    <span style={{ fontSize: '12px', color: '#6b6b80' }}>{vttProgress}/{vttTotal}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '3px', background: '#e50914', width: vttTotal > 0 ? `${(vttProgress / vttTotal) * 100}%` : '0%', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              )}
              {vttResult && (
                <div style={{ background: '#12121a', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#22c55e' }}>Perkthimi u krye!</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={handleDownloadVtt}
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                        Shkarko .vtt
                      </button>
                      {!vttUploadedUrl && (
                        <button onClick={handleUploadToBunny} disabled={vttUploading}
                          style={{ background: vttUploading ? '#2a2a3a' : '#f5a623', border: 'none', color: vttUploading ? '#6b6b80' : '#000', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: vttUploading ? 'not-allowed' : 'pointer' }}>
                          {vttUploading ? 'Duke ngarkuar...' : 'Ngarko te Bunny'}
                        </button>
                      )}
                    </div>
                  </div>
                  {vttUploadedUrl && (
                    <div style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '6px', padding: '12px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#f5a623', marginBottom: '6px', fontWeight: 500 }}>CDN URL — kopjo te admin filmi:</div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input readOnly value={vttUploadedUrl} style={{ ...INP, fontSize: '11px', fontFamily: 'monospace', flex: 1 }} />
                        <button onClick={() => { navigator.clipboard.writeText(vttUploadedUrl); showToast('URL u kopjua!') }}
                          style={{ background: '#f5a623', border: 'none', color: '#000', padding: '10px 14px', borderRadius: '5px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                          Kopjo
                        </button>
                      </div>
                    </div>
                  )}
                  <textarea readOnly value={vttResult} rows={8} style={{ ...INP, resize: 'vertical', fontSize: '11px', color: '#6b6b80', fontFamily: 'monospace' }} />
                </div>
              )}
            </div>
          )}

          {/* ═══ SETTINGS ═══ */}
          {active === 'settings' && (
            <div style={{ maxWidth: '620px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px' }}>
                <div style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Informacioni i Sitit</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Titulli i faqes</label>
                    <input value={siteTitle} onChange={e => setSiteTitle(e.target.value)} style={INP} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Email kontakti</label>
                    <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} style={INP} />
                  </div>
                </div>
              </div>
              <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px' }}>
                <div style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Bunny.net Konfigurimi</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Library ID</label>
                    <input defaultValue="647882" style={INP} readOnly />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '10px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px' }}>Subtitles CDN</label>
                    <input defaultValue="https://cinealsubtitles.b-cdn.net" style={INP} readOnly />
                  </div>
                  <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '6px', padding: '10px 12px', fontSize: '12px', color: '#22c55e' }}>
                    Embed URL: https://iframe.mediadelivery.net/embed/647882/VIDEO_ID?captions=sq
                  </div>
                </div>
              </div>
              <div style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px' }}>
                <div style={{ fontSize: '11px', color: '#6b6b80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Mirëmbajtja</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => setMaintenance(!maintenance)}>
                  <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: maintenance ? '#e50914' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: '3px', left: maintenance ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px' }}>Modaliteti i mirëmbajtjes</div>
                    <div style={{ fontSize: '11px', color: '#6b6b80', marginTop: '2px' }}>Kur aktiv, faqja shfaq mesazh mirëmbajtjeje</div>
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
