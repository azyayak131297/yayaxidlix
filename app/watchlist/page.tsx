import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { fetchMovieDetails, fetchSeriesDetails } from "@/lib/tmdb"
import { Header } from "@/components/Header"
import Image from "next/image"
import Link from "next/link"

export const dynamic = "force-dynamic"

async function getWatchlistItems() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return []

  const items = await prisma.watchlist.findMany({
    where: { userId },
    select: { contentId: true, contentType: true, createdAt: true }
  })

  return items
}

type WatchlistItem = {
  contentId: string
  contentType: string
  createdAt: Date
  title?: string
  posterPath?: string | null
  backdropPath?: string | null
  year?: string
}

async function enrichWatchlist(items: Awaited<ReturnType<typeof getWatchlistItems>>): Promise<WatchlistItem[]> {
  const customIds = items.filter((i) => i.contentId.startsWith("custom-")).map((i) => i.contentId)
  const customContents = await prisma.customContent.findMany({
    where: { id: { in: customIds } },
    select: { id: true, title: true, posterPath: true, backdropPath: true, releaseYear: true, type: true },
  })
  const customMap = new Map(customContents.map((c) => [c.id, c]))

  const tmdbItems = items.filter((i) => !i.contentId.startsWith("custom-"))
  const tmdbMovies = tmdbItems.filter((i) => i.contentType === "movie")
  const tmdbSeries = tmdbItems.filter((i) => i.contentType === "tv")

  const [movieDetails, seriesDetails] = await Promise.all([
    Promise.all(tmdbMovies.map((i) => fetchMovieDetails(i.contentId).then((m) => ({ id: i.contentId, data: m })))),
    Promise.all(tmdbSeries.map((i) => fetchSeriesDetails(i.contentId).then((s) => ({ id: i.contentId, data: s })))),
  ])

  const movieMap = new Map(
    movieDetails
      .filter((m) => m.data)
      .map((m) => [m.id, { title: m.data!.title, posterPath: m.data!.poster_path, backdropPath: m.data!.backdrop_path, year: m.data!.release_date?.slice(0, 4) }])
  )
  const seriesMap = new Map(
    seriesDetails
      .filter((s) => s.data)
      .map((s) => [s.id, { title: s.data!.name, posterPath: s.data!.poster_path, backdropPath: s.data!.backdrop_path, year: s.data!.first_air_date?.slice(0, 4) }])
  )

  return items.map((item) => {
    const custom = customMap.get(item.contentId)
    if (custom) {
      return {
        contentId: item.contentId,
        contentType: item.contentType,
        createdAt: item.createdAt,
        title: custom.title,
        posterPath: custom.posterPath,
        backdropPath: custom.backdropPath,
        year: custom.releaseYear ? String(custom.releaseYear) : undefined,
      }
    }
    const tmdb = item.contentType === "movie" ? movieMap.get(item.contentId) : seriesMap.get(item.contentId)
    if (tmdb) {
      return { ...item, ...tmdb }
    }
    return item
  })
}

export default async function WatchlistPage() {
  const items = await getWatchlistItems()
  const enriched = await enrichWatchlist(items)

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mb-2">Watchlist</h1>
        <p className="text-zinc-400 mb-8">
          {items.length > 0 ? `${items.length} item di watchlist` : "Watchlist kamu kosong"}
        </p>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⭐</div>
            <h2 className="text-xl font-semibold mb-2">Belum ada item</h2>
            <p className="text-zinc-400">Tambah konten ke watchlist dari halaman detail film atau series.</p>
            <Link href="/" className="text-red-400 hover:underline mt-4 inline-block">
              ← Jelajah konten
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {enriched.map((item: any) => (
              <Link
                key={`watchlist-${item.contentId}`}
                href={item.contentType === "tv" ? `/series/${item.contentId}` : `/movie/${item.contentId}`}
                className="group relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-800"
              >
                {item.posterPath ? (
                  <Image
                    src={item.posterPath.startsWith("http") ? item.posterPath : `https://image.tmdb.org/t/p/w500${item.posterPath}`}
                    alt={item.title || item.contentId}
                    fill
                    className="object-cover transition-opacity duration-200 group-hover:opacity-80"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xs">
                    No Img
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <span className="text-center text-sm font-semibold text-white">
                    {item.contentType === "tv" ? "📺" : "🎬"} {item.title || item.contentId}
                  </span>
                </div>
                {item.year && (
                  <span className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-zinc-200">
                    {item.year}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}