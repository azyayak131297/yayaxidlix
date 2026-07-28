"use client"

import { useState, FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useSiteSettings } from "@/components/SiteSettingsProvider"

type SiteSettings = {
  site: {
    title: string
    description: string
    accentColor: string
    logoText: string
  }
  features: {
    showTmdb: boolean
    showLocal: boolean
    showTrailer: boolean
    showCast: boolean
  }
}

type HeaderProps = {
  settings?: SiteSettings
}

const defaultSettings: SiteSettings = {
  site: {
    title: "IDLIX",
    description: "Platform streaming pribadi",
    accentColor: "#dc2626",
    logoText: "IDLIX",
  },
  features: {
    showTmdb: true,
    showLocal: true,
    showTrailer: true,
    showCast: true,
  },
}

export function Header({ settings: settingsProp }: HeaderProps = {}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const context = useSiteSettings()
  const settings = settingsProp || context.settings

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    setMobileMenuOpen(false)
  }

  const navLinks = [
    { href: "/", label: "Beranda" },
    ...(settings.features.showLocal ? [{ href: "/local", label: "Lokal" }] : []),
    { href: "/genre", label: "Genre" },
    { href: "/country", label: "Negara" },
    { href: "/year", label: "Tahun" },
    { href: "/network", label: "Jaringan" },
    { href: "/collection", label: "Koleksi" },
    { href: "/tonton", label: "Tonton" },
    { href: "/watchlist", label: "Watchlist" },
    { href: "/admin", label: "Admin" },
  ]

  return (
    <header className="border-b border-zinc-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded bg-red-600 px-4 py-2 text-sm font-medium text-white"
      >
        Skip to content
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold text-red-500 flex-shrink-0" aria-label="IDLIX Home" style={{ color: settings.site.accentColor }}>
          {settings.site.logoText}
        </Link>

        <form onSubmit={handleSubmit} className="flex-1 max-w-xl hidden sm:block">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari film, series..."
              aria-label="Search movies and series"
              className="w-full rounded-full bg-zinc-900 border border-zinc-700 px-4 py-2 pl-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-zinc-300 hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {status === "loading" ? null : session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-300 hidden sm:inline-block">
                {session.user.name || session.user.email}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-zinc-300 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm text-zinc-300 hover:text-white transition-colors hidden sm:inline-block">
              Login
            </Link>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-black/95 backdrop-blur-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-3" aria-label="Mobile navigation">
            <form onSubmit={handleSubmit} className="mb-2">
              <div className="relative">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari film, series..."
                  aria-label="Search movies and series"
                  className="w-full rounded-full bg-zinc-900 border border-zinc-700 px-4 py-2 pl-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
            {navLinks.map((link) => (link.href === "/" ? (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white text-sm py-1">{link.label}</Link>
            ) : (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white text-sm py-1">{link.label}</Link>
            )))}
            {status === "loading" ? null : session?.user ? (
              <>
                <span className="text-zinc-300 text-sm py-1">{session.user.name || session.user.email}</span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-zinc-300 hover:text-white text-sm py-1 text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white text-sm py-1">Login</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
