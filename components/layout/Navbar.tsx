'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Navbar() {
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/filma', label: 'Filma' },
    { href: '/seriale', label: 'Seriale' },
    { href: '/anime', label: 'Anime' },
    { href: '/trending', label: 'Trending' },
  ]

  return (
    <nav style={{ background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100, padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
        <img src="/logo.svg" alt="Cineal" style={{ height: '32px', width: 'auto' }} />
      </Link>

      <ul style={{ display: 'flex', gap: '28px', listStyle: 'none', margin: 0, padding: 0 }}>
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} style={{ color: pathname === href ? '#fff' : '#b0b0c0', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s', fontWeight: pathname === href ? 500 : 400 }}
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
        <Link href="/auth/login">
          <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#b0b0c0', padding: '7px 18px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Hyr</button>
        </Link>
        <Link href="/auth/register">
          <button style={{ background: '#e50914', border: 'none', color: '#fff', padding: '7px 18px', borderRadius: '4px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Regjistrohu</button>
        </Link>
      </div>
    </nav>
  )
}
