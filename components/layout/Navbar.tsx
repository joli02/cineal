'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
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

  const links = [
    { href: '/', label: 'Home' },
    { href: '/filma', label: 'Filma' },
    { href: '/seriale', label: 'Seriale' },
    { href: '/anime', label: 'Anime' },
    { href: '/trending', label: 'Trending' },
  ]

  const roleBadge: Record<string, string> = {
    free: '#6b6b80', vip: '#f5a623', premium: '#22c55e', moderator: '#3b82f6', admin: '#e50914'
  }

  return (
    <nav style={{ background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100, padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', letterSpacing: '3px', color: '#fff' }}>
          <span style={{ color: '#e50914' }}>C</span>INEAL
        </div>
      </Link>

      <ul style={{ display: 'flex', gap: '28px', listStyle: 'none', margin: 0, padding: 0 }}>
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} style={{ color: pathname === href ? '#fff' : '#b0b0c0', textDecoration: 'none', fontSize: '13px', fontWeight: pathname === href ? 500 : 400 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = pathname === href ? '#fff' : '#b0b0c0')}
            >{label}</Link>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {searchOpen ? (
          <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && search) window.location.href = `/filma?kerko=${encodeURIComponent(search)}`; if (e.key === 'Escape') setSearchOpen(false) }}
            placeholder="Kërko filma..."
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '7px 14px', borderRadius: '4px', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", outline: 'none', width: '200px' }} />
        ) : (
          <button onClick={() => setSearchOpen(true)} style={{ background: 'transparent', border: 'none', color: '#b0b0c0', fontSize: '16px', cursor: 'pointer', padding: '6px' }}>🔍</button>
        )}

        {user ? (
          <div style={{ position: 'relative' }}>
            <div onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(229,9,20,0.2)', border: '2px solid rgba(229,9,20,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px' }}>
              👤
            </div>

            {dropdownOpen && (
              <div style={{ position: 'absolute', right: 0, top: '44px', background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', minWidth: '220px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 999 }}>
                
                {/* User Info */}
                <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '6px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#fff', marginBottom: '4px' }}>
                    {profile?.full_name || user.email?.split('@')[0]}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b6b80', marginBottom: '6px' }}>{user.email}</div>
                  <span style={{ fontSize: '10px', background: `${roleBadge[profile?.role || 'free']}22`, border: `1px solid ${roleBadge[profile?.role || 'free']}44`, color: roleBadge[profile?.role || 'free'], padding: '2px 8px', borderRadius: '10px', fontWeight: 500 }}>
                    {(profile?.role || 'FREE').toUpperCase()}
                  </span>
                </div>

                {/* Menu Items */}
                {[
                  { href: '/watchlist', icon: '📋', label: 'Watchlist ime' },
{ href: '/preferuarat', icon: '❤️', label: 'Të preferuarat' },
                  { href: '/historiku', icon: '🕐', label: 'Historiku' },
                  { href: '/settings', icon: '⚙️', label: 'Cilësimet' },
                ].map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '6px', textDecoration: 'none', color: '#b0b0c0', fontSize: '13px' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <span>{item.icon}</span><span>{item.label}</span>
                  </Link>
                ))}

                {/* Admin Link */}
                {(profile?.role === 'admin' || profile?.role === 'moderator') && (
                  <Link href="/admin" onClick={() => setDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '6px', textDecoration: 'none', color: '#e50914', fontSize: '13px' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(229,9,20,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <span>🎬</span><span>Admin Panel</span>
                  </Link>
                )}

                {/* Logout */}
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
            <Link href="/auth/login">
              <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#b0b0c0', padding: '7px 18px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Hyr</button>
            </Link>
            <Link href="/auth/register">
              <button style={{ background: '#e50914', border: 'none', color: '#fff', padding: '7px 18px', borderRadius: '4px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Regjistrohu</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}