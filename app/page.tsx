import { prisma } from "@/lib/prisma"
import { ContentCard } from "@/components/ContentCard"
import { Header } from "@/components/Header"
import Link from "next/link"
import Image from "next/image"
import { loadLocalContent } from "@/lib/local-content"
import { loadSiteSettings } from "@/lib/site-settings"

async function getCustomContent() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/content/custom`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data || []
  } catch {
    return []
  }
}

export const dynamic = "force-dynamic"

async function getContinueWatching() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/continue-watching`, {
      cache: "no-store",
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data || []
  } catch {
    return []
  }
}

export default async function Home() {
  const [customContent, localContent, continueWatching] = await Promise.all([
    getCustomContent(),
    Promise.resolve(loadLocalContent()),
    getContinueWatching(),
  ])

  const settings = loadSiteSettings()
  const hasCustom = customContent.length > 0
  const hasLocal = settings.features.showLocal && localContent.length > 0
  const hasAny = hasCustom || hasLocal

  const featured = customContent[0] || localContent[0] || null
  const heroTitle = featured?.title || settings.site.title
  const heroPoster = featured?.posterPath || null
  const heroBackdrop = featured?.backdropPath || null
  const heroYear = featured?.releaseYear ? String(featured.releaseYear) : ""
  const heroRating = featured?.rating || null
  const heroOverview = featured?.overview || ""
  const heroMediaType = featured?.type || "movie"
  const heroId = featured?.id || null

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />

      <main>
        <section className="relative w-full min-h-[70vh] overflow-hidden">
          {hasAny && heroBackdrop ? (
            <>
              <Image
                src={heroBackdrop.startsWith("http") ? heroBackdrop : `https://image.tmdb.org/t/p/original${heroBackdrop}`}
                alt={heroTitle}
                fill
                className="object-cover opacity-40"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/50 to-black" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(220,38,38,0.15)_0%,_transparent_70%)]" />
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-end">
              {hasAny && heroPoster ? (
                <div className="hidden md:block w-48 lg:w-64 flex-shrink-0">
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-2xl">
                    <Image
                      src={heroPoster.startsWith("http") ? heroPoster : `https://image.tmdb.org/t/p/w500${heroPoster}`}
                      alt={heroTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : hasAny ? (
                <div className="hidden md:block w-48 lg:w-64 flex-shrink-0">
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-800 shadow-2xl">
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-4xl">🎬</div>
                  </div>
                </div>
              ) : null}

              <div className="flex-1">
                {hasAny ? (
                  <>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">{heroTitle}</h1>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      {heroYear && <span className="text-zinc-300 font-medium">{heroYear}</span>}
                      {heroRating && <span className="text-yellow-400 font-medium">⭐ {Number(heroRating).toFixed(1)}</span>}
                      <span className="px-3 py-1 rounded bg-red-600 text-xs font-bold uppercase tracking-wider">
                        {featured?.media_type === "tv" ? "Series" : "Film"}
                      </span>
                    </div>
                    {heroOverview && (
                      <p className="text-zinc-300 text-sm md:text-base max-w-2xl line-clamp-3 mb-6">{heroOverview}</p>
                    )}
                    <div className="flex gap-3">
                      {heroId && (
                        <Link href={heroMediaType === "tv" ? `/watch/tv/${heroId}` : `/watch/movie/${heroId}`} className="rounded bg-red-600 px-6 py-3 text-sm font-bold hover:bg-red-500 transition-colors">
                          ▶ Tonton Sekarang
                        </Link>
                      )}
                      {heroId && (
                        <Link href={heroMediaType === "tv" ? `/series/${heroId}` : `/movie/${heroId}`} className="rounded border border-zinc-600 px-6 py-3 text-sm font-medium hover:border-zinc-400 hover:text-white transition-colors">
                          ℹ️ Detail
                        </Link>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-6">🎬</div>
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-4">IDLIX</h1>
                    <p className="text-xl text-zinc-300 max-w-2xl mb-8">
                      Hybrid streaming platform — gabungkan film TMDB dengan konten manual untuk pengalaman menonton terbaik
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <Link href="/tonton" className="rounded bg-red-600 px-8 py-4 text-lg font-bold hover:bg-red-500 transition-colors">
                        ▶ Mulai Menonton
                      </Link>
                      <Link href="/admin" className="rounded border border-zinc-600 px-8 py-4 text-lg font-medium hover:border-zinc-400 hover:text-white transition-colors">
                        ⚙️ Tambah Konten
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

            {continueWatching.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Terakhir Menonton</h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {continueWatching.map((item: any) => {
                    const href = item.contentType === "tv" ? `/watch/tv/${item.contentId}` : `/watch/movie/${item.contentId}`
                    return (
                      <Link
                        key={`${item.contentId}-${item.episodeKey || ""}`}
                        href={href}
                        className="flex-shrink-0 w-48 rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-600 transition-colors"
                      >
                        <h3 className="font-medium text-white truncate mb-1">{item.contentId}</h3>
                        <p className="text-xs text-zinc-400 mb-2">
                          {item.contentType === "tv" ? "Series" : "Film"}
                          {item.episodeKey ? ` • ${item.episodeKey}` : ""}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-red-600" style={{ width: `${item.durationSeconds > 0 ? (item.progressSeconds / item.durationSeconds) * 100 : 0}%` }} />
                          </div>
                          <span className="text-[10px] text-zinc-500">{Math.round((item.progressSeconds / item.durationSeconds) * 100) || 0}%</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {(customContent.length > 0 || localContent.length > 0) && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Daftar Populer</h2>
                  <Link href="/tonton" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: settings.site.accentColor }}>Lihat semua →</Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {[...customContent, ...localContent]
                    .sort((a: any, b: any) => (b.viewCount || 0) - (a.viewCount || 0))
                    .slice(0, 20)
                    .map((item: any) => (
                      <ContentCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        posterPath={item.posterPath}
                        releaseDate={item.releaseYear ? String(item.releaseYear) : undefined}
                        mediaType={item.type as "movie" | "tv"}
                        href={item.type === "tv" ? `/watch/tv/${item.id}` : `/watch/movie/${item.id}`}
                      />
                    ))}
                </div>
              </section>
            )}

            {(customContent.length > 0 || localContent.length > 0) && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Terbaru</h2>
                  <Link href="/tonton" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: settings.site.accentColor }}>Lihat semua →</Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {[...customContent, ...localContent]
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 20)
                    .map((item: any) => (
                      <ContentCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        posterPath={item.posterPath}
                        releaseDate={item.releaseYear ? String(item.releaseYear) : undefined}
                        mediaType={item.type as "movie" | "tv"}
                        href={item.type === "tv" ? `/watch/tv/${item.id}` : `/watch/movie/${item.id}`}
                      />
                    ))}
                </div>
              </section>
            )}

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <Link href="/genre" className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 opacity-80 hover:opacity-100" style={{ backgroundImage: `url(${settings.backgrounds.homeGenre})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white group-hover:text-red-400 transition-colors font-semibold text-sm md:text-base drop-shadow">Genre</span>
                  </div>
                </Link>
                <Link href="/country" className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 opacity-80 hover:opacity-100" style={{ backgroundImage: `url(${settings.backgrounds.homeCountry})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white group-hover:text-red-400 transition-colors font-semibold text-sm md:text-base drop-shadow">Negara</span>
                  </div>
                </Link>
                <Link href="/year" className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 opacity-80 hover:opacity-100" style={{ backgroundImage: `url(${settings.backgrounds.homeYear})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white group-hover:text-red-400 transition-colors font-semibold text-sm md:text-base drop-shadow">Tahun</span>
                  </div>
                </Link>
                <Link href="/network" className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 opacity-80 hover:opacity-100" style={{ backgroundImage: `url(${settings.backgrounds.homeNetwork})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white group-hover:text-red-400 transition-colors font-semibold text-sm md:text-base drop-shadow">Jaringan</span>
                  </div>
                </Link>
              </div>
            </section>
        </main>
    </div>
  )
}
