'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const FILM_CATEGORIES = [
  { label: 'Aksion', href: '/filma?zhanri=Aksion' },
  { label: 'Drama', href: '/filma?zhanri=Drama' },
  { label: 'Comedy', href: '/filma?zhanri=Comedy' },
  { label: 'Sci-Fi', href: '/filma?zhanri=Sci-Fi' },
  { label: 'Thriller', href: '/filma?zhanri=Thriller' },
  { label: 'Horror', href: '/filma?zhanri=Horror' },
  { label: 'Romance', href: '/filma?zhanri=Romance' },
  { label: 'Dokumentar', href: '/filma?zhanri=Dokumentar' },
  { label: 'Filma Shqip', href: '/filma?zhanri=Shqip' },
  { label: 'Old Movies', href: '/filma?zhanri=Old' },
]

export default function Navbar() {
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [filmaHover, setFilmaHover] = useState(false)
  const filmaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setDropdownOpen(false)
    router.push('/')
  }

  const handleFilmaEnter = () => {
    if (filmaTimer.current) clearTimeout(filmaTimer.current)
    setFilmaHover(true)
  }

  const handleFilmaLeave = () => {
    filmaTimer.current = setTimeout(() => setFilmaHover(false), 200)
  }

  const roleBadge: Record<string, string> = {
    free: '#6b6b80', vip: '#f5a623', premium: '#22c55e', moderator: '#3b82f6', admin: '#e50914'
  }

  const menuItems = [
    { href: '/watchlist', icon: '📋', label: 'Watchlist ime' },
    { href: '/preferuarat', icon: '❤️', label: 'Të preferuarat' },
    { href: '/historiku', icon: '🕐', label: 'Historiku' },
    { href: '/settings', icon: '⚙️', label: 'Cilësimet' },
  ]

  const links = [
    { href: '/', label: 'Home' },
    { href: '/seriale', label: 'Seriale' },
    { href: '/anime', label: 'Anime' },
    { href: '/kids', label: 'Kids' },
    { href: '/vip', label: 'VIP' },
  ]

  return (
    <>
      <nav style={{ background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100, padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img src="/logo.svg" alt="Cineal" style={{ height: '28px', width: 'auto', maxWidth: '120px' }} />
        </Link>

        {/* Desktop Links */}
        <ul className="desktop-nav" style={{ display: 'flex', gap: '28px', listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }}>

          {/* Home */}
          <li>
            <Link href="/" style={{ color: pathname === '/' ? '#fff' : '#b0b0c0', textDecoration: 'none', fontSize: '13px', fontWeight: pathname === '/' ? 500 : 400 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = pathname === '/' ? '#fff' : '#b0b0c0')}>
              Home
            </Link>
          </li>

          {/* Filma — dropdown only, no navigation */}
          <li style={{ position: 'relative' }}
            onMouseEnter={handleFilmaEnter}
            onMouseLeave={handleFilmaLeave}>
            <span style={{ color: '#b0b0c0', fontSize: '13px', cursor: 'default', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Filma
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </span>

            {filmaHover && (
              <div
                onMouseEnter={handleFilmaEnter}
                onMouseLeave={handleFilmaLeave}
                style={{
                  position: 'absolute', top: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)',
                  background: '#12121a', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '8px 0', minWidth: '180px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 200,
                }}>
                {FILM_CATEGORIES.map(cat => (
                  <Link key={cat.href} href={cat.href}
                    onClick={() => setFilmaHover(false)}
                    style={{ display: 'block', padding: '9px 18px', fontSize: '13px', color: '#b0b0c0', textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,9,20,0.08)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#b0b0c0' }}>
                    {cat.label}
                  </Link>
                ))}
              </div>
            )}
          </li>

          {/* Other links */}
          {links.filter(l => l.href !== '/').map(({ href, label }) => (
            <li key={href}>
              <Link href={href} style={{ color: pathname === href ? '#fff' : '#b0b0c0', textDecoration: 'none', fontSize: '13px', fontWeight: pathname === href ? 500 : 400 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = pathname === href ? '#fff' : '#b0b0c0')}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {searchOpen ? (
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && search) { router.push(`/filma?kerko=${encodeURIComponent(search)}`); setSearchOpen(false); setSearch('') }
                if (e.key === 'Escape') setSearchOpen(false)
              }}
              placeholder="Kërko filma..."
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '7px 14px', borderRadius: '4px', fontSize: '13px', outline: 'none', width: '200px' }} />
          ) : (
            <button onClick={() => setSearchOpen(true)}
              style={{ background: 'transparent', border: 'none', color: '#b0b0c0', cursor: 'pointer', padding: '6px', display: 'flex' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          )}

          {user ? (
            <div style={{ position: 'relative' }}>
              <div onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(229,9,20,0.2)', border: '2px solid rgba(229,9,20,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px' }}>
                {profile?.gender === 'female' ? '👩' : '👤'}
              </div>

              {dropdownOpen && (
                <div style={{ position: 'absolute', right: 0, top: '44px', background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', minWidth: '220px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 999 }}>
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '6px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff', marginBottom: '4px' }}>{profile?.full_name || user.email?.split('@')[0]}</div>
                    <div style={{ fontSize: '11px', color: '#6b6b80', marginBottom: '6px' }}>{user.email}</div>
                    <span style={{ fontSize: '10px', background: `${roleBadge[profile?.role || 'free']}22`, border: `1px solid ${roleBadge[profile?.role || 'free']}44`, color: roleBadge[profile?.role || 'free'], padding: '2px 8px', borderRadius: '10px', fontWeight: 500 }}>
                      {(profile?.role || 'FREE').toUpperCase()}
                    </span>
                  </div>
                  {menuItems.map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '6px', textDecoration: 'none', color: '#b0b0c0', fontSize: '13px' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <span>{item.icon}</span><span>{item.label}</span>
                    </Link>
                  ))}
                  {(profile?.role === 'admin' || profile?.role === 'moderator') && (
                    <Link href="/admin" onClick={() => setDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '6px', textDecoration: 'none', color: '#e50914', fontSize: '13px' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(229,9,20,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <span>🎬</span><span>Admin Panel</span>
                    </Link>
                  )}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: '6px', paddingTop: '6px' }}>
                    <button onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '6px', background: 'transparent', border: 'none', color: '#ff6b6b', fontSize: '13px', cursor: 'pointer', width: '100%', fontFamily: "'DM Sans', sans-serif" }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,107,107,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <span>🚪</span><span>Dil</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login"><button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#b0b0c0', padding: '7px 18px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>Hyr</button></Link>
              <Link href="/auth/register"><button style={{ background: '#e50914', border: 'none', color: '#fff', padding: '7px 18px', borderRadius: '4px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Regjistrohu</button></Link>
            </>
          )}

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'none', background: 'transparent', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0, background: 'rgba(10,10,15,0.98)', zIndex: 99, padding: '20px', overflowY: 'auto' }}>
          <Link href="/" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '14px 0', fontSize: '18px', color: pathname === '/' ? '#e50914' : '#fff', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>Home</Link>
          <div style={{ padding: '14px 0', fontSize: '18px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>Filma</div>
          {FILM_CATEGORIES.map(cat => (
            <Link key={cat.href} href={cat.href} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '10px 0 10px 20px', fontSize: '14px', color: '#b0b0c0', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {cat.label}
            </Link>
          ))}
          {['/seriale', '/anime', '/kids', '/vip'].map(href => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '14px 0', fontSize: '18px', color: pathname === href ? '#e50914' : '#fff', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {href === '/seriale' ? 'Seriale' : href === '/anime' ? 'Anime' : href === '/kids' ? 'Kids' : 'VIP'}
            </Link>
          ))}
          {!user && (
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff', textDecoration: 'none', fontSize: '15px' }}>Hyr</Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '12px', textAlign: 'center', background: '#e50914', borderRadius: '6px', color: '#fff', textDecoration: 'none', fontSize: '15px', fontWeight: 600 }}>Regjistrohu</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  )
}
