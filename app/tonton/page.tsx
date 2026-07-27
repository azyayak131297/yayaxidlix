import { fetchTrending, fetchNowPlayingMovies, fetchOnTheAirSeries } from "@/lib/tmdb"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/Header"
import Link from "next/link"
import Image from "next/image"

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

export default async function TontonPage() {
  const [trending, movies, series, customContent] = await Promise.all([
    fetchTrending(),
    fetchNowPlayingMovies(),
    fetchOnTheAirSeries(),
    getCustomContent(),
  ])

  const allItems = [
    ...customContent.map((item: any) => ({
      ...item,
      href: item.type === "tv" ? `/watch/tv/${item.id}` : `/watch/movie/${item.id}`,
      badge: "Custom" as const,
    })),
    ...(movies || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      posterPath: item.poster_path,
      href: `/watch/movie/${item.id}`,
      badge: "TMDB" as const,
    })),
    ...(series || []).map((item: any) => ({
      id: item.id,
      title: item.name,
      posterPath: item.poster_path,
      href: `/watch/tv/${item.id}`,
      badge: "TMDB" as const,
    })),
    ...(trending || []).map((item: any) => ({
      id: item.id,
      title: item.title || item.name,
      posterPath: item.poster_path,
      href: item.media_type === "tv" ? `/watch/tv/${item.id}` : `/watch/movie/${item.id}`,
      badge: (item.media_type === "tv" ? "Series" : "Film") as string,
    })),
  ]

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mb-2">Tonton Sekarang</h1>
        <p className="text-zinc-400 mb-8">Pilih konten untuk mulai menonton</p>

        {allItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">▶</div>
            <h2 className="text-xl font-semibold mb-2">Belum ada konten</h2>
            <p className="text-zinc-400 max-w-md mx-auto">
              Tambahkan konten manual lewat <a href="/admin" className="text-red-400 underline">Admin</a> atau isi TMDB_API_KEY di .env.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {allItems.map((item: any) => (
              <Link
                key={item.href}
                href={item.href}
                className="group"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-800 mb-2">
                  {item.posterPath ? (
                    <Image
                      src={item.posterPath}
                      alt={item.title}
                      fill
                      className="object-cover transition-opacity duration-200 group-hover:opacity-80"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-500 text-xs">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="absolute top-2 right-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300 capitalize">
                      {item.badge}
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-zinc-100 truncate group-hover:text-white transition-colors">
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}