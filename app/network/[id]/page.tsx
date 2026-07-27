import { fetchMoviesByNetwork, fetchSeriesByNetwork } from "@/lib/tmdb"
import { Header } from "@/components/Header"
import Image from "next/image"
import Link from "next/link"
import { loadNetworkBackdrops } from "@/lib/network-backdrops"

type NetworkPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}

export const dynamic = "force-dynamic"

const PAGE_SIZE = 20

async function getNetworkData(id: string, page: number) {
  const [movies, series] = await Promise.all([
    fetchMoviesByNetwork(Number(id), page),
    fetchSeriesByNetwork(Number(id), page),
  ])
  return { movies, series }
}

export default async function NetworkDetailPage({ params, searchParams }: NetworkPageProps) {
  const { id } = await params
  const { page } = await searchParams
  const currentPage = page ? Math.max(1, Number(page)) : 1
  const { movies, series } = await getNetworkData(id, currentPage)

  const allContent = [
    ...movies.map((item: any) => ({ ...item, mediaType: "movie" })),
    ...series.map((item: any) => ({ ...item, mediaType: "tv" })),
  ].sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))

  const totalPages = Math.max(1, Math.ceil(allContent.length / PAGE_SIZE))
  const pagedContent = allContent.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const backdrops = loadNetworkBackdrops()
  const backdrop = backdrops.backdrops[id]
  const networkName = backdrop?.network || `Jaringan #${id}`
  const color = backdrop?.color || "#113CCF"

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {backdrop ? (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <Image
            src={backdrop.backdropUrl}
            alt={networkName}
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
          <div className="absolute bottom-6 left-4 sm:left-8 lg:left-12">
            <Link href="/network" className="text-zinc-400 hover:text-white text-sm mb-2 inline-block">
              ← Kembali ke Jaringan
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
              {networkName}
            </h1>
            <p className="text-zinc-400 mt-2">
              {allContent.length} hasil
            </p>
          </div>
        </div>
      ) : (
        <div className="relative h-40 overflow-hidden" style={{ backgroundColor: color }}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute bottom-6 left-4 sm:left-8 lg:left-12">
            <Link href="/network" className="text-zinc-400 hover:text-white text-sm mb-2 inline-block">
              ← Kembali ke Jaringan
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">
              {networkName}
            </h1>
            <p className="text-zinc-400 mt-2">
              {allContent.length} hasil
            </p>
          </div>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {allContent.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📺</div>
            <h2 className="text-xl font-semibold mb-2">Tidak ada konten</h2>
            <p className="text-zinc-400">Belum ada film/series untuk jaringan ini.</p>
            {backdrop && (
              <Link
                href="/admin"
                className="mt-4 inline-flex items-center gap-2 rounded bg-red-600 px-5 py-2.5 text-sm font-semibold hover:bg-red-500 transition-colors"
              >
                Kelola Backdrop
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {pagedContent.map((item: any) => (
                <Link
                  key={`${item.mediaType}-${item.id}`}
                  href={item.mediaType === "tv" ? `/series/${item.id}` : `/movie/${item.id}`}
                  className="group"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-800 mb-2">
                    {item.poster_path ? (
                      <Image
                        src={item.poster_path}
                        alt={item.title || item.name}
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
                  </div>
                  <h3 className="text-sm font-medium text-zinc-100 truncate group-hover:text-white transition-colors">
                    {item.title || item.name}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate">
                    {item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || "TBA"} •{" "}
                    {item.mediaType === "tv" ? "Series" : "Movie"}
                  </p>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                {currentPage > 1 && (
                  <Link
                    href={`/network/${id}?page=${currentPage - 1}`}
                    className="rounded bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    ← Sebelumnya
                  </Link>
                )}
                {currentPage < totalPages && (
                  <Link
                    href={`/network/${id}?page=${currentPage + 1}`}
                    className="rounded bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-500 transition-colors"
                  >
                    Berikutnya →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}