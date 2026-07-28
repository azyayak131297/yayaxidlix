import { fetchMoviesByGenre, fetchSeriesByGenre } from "@/lib/tmdb"
import { loadLocalContent } from "@/lib/local-content"
import { loadGenres } from "@/lib/genres"
import { Header } from "@/components/Header"
import Image from "next/image"
import Link from "next/link"

type GenrePageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}

export const dynamic = "force-dynamic"

const PAGE_SIZE = 20

async function getGenreData(genreId: string, page: number) {
  const [movies, series] = await Promise.all([
    fetchMoviesByGenre(Number(genreId), page),
    fetchSeriesByGenre(Number(genreId), page)
  ])
  return { movies, series }
}

export default async function GenreDetailPage({ params, searchParams }: GenrePageProps) {
  const { id } = await params
  const { page } = await searchParams
  const currentPage = page ? Math.max(1, Number(page)) : 1
  const { movies, series } = await getGenreData(id, currentPage)

  const genres = loadGenres()
  const genre = genres.find((g) => String(g.id) === id)
  const genreName = genre?.name || id

  const localContent = loadLocalContent()
  const localMovies = localContent.filter((item) => item.type === "movie" && item.genres.some((g) => {
    const matched = genres.find((genre) => genre.name.toLowerCase() === g.toLowerCase())
    return matched ? String(matched.id) === id : false
  }))
  const localSeries = localContent.filter((item) => item.type === "tv" && item.genres.some((g) => {
    const matched = genres.find((genre) => genre.name.toLowerCase() === g.toLowerCase())
    return matched ? String(matched.id) === id : false
  }))

  const allContent = [
    ...movies.map((item: any) => ({ ...item, mediaType: "movie", source: "tmdb" })),
    ...series.map((item: any) => ({ ...item, mediaType: "tv", source: "tmdb" })),
    ...localMovies.map((item) => ({ ...item, mediaType: "movie", source: "local" })),
    ...localSeries.map((item) => ({ ...item, mediaType: "tv", source: "local" })),
  ].sort((a: any, b: any) => (b.popularity || b.vote_average || 0) - (a.popularity || a.vote_average || 0))

  const totalPages = Math.max(1, Math.ceil(allContent.length / PAGE_SIZE))
  const pagedContent = allContent.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link href="/genre" className="text-zinc-400 hover:text-white text-sm mb-4 inline-block">
            ← Kembali ke Genre
          </Link>
          <h1 className="text-3xl font-bold">Genre: {genreName}</h1>
          <p className="text-zinc-400 mt-2">{allContent.length} hasil (halaman {currentPage} dari {totalPages})</p>
        </div>

        {allContent.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎬</div>
            <h2 className="text-xl font-semibold mb-2">Tidak ada konten</h2>
            <p className="text-zinc-400">Belum ada film/series untuk genre ini.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {pagedContent.map((item: any) => {
                const href = item.source === "local" ? `/watch/${item.mediaType}/${item.id}` : (item.mediaType === "tv" ? `/series/${item.id}` : `/movie/${item.id}`)
                const posterSrc = item.posterPath || item.poster_path || ""
                const imgSrc = posterSrc ? (posterSrc.startsWith("http") ? posterSrc : `https://image.tmdb.org/t/p/w300${posterSrc}`) : ""
                const year = item.releaseYear ? String(item.releaseYear) : (item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || "TBA")
                const title = item.title || item.name || "Untitled"

                return (
                  <Link key={`${item.mediaType}-${item.id}`} href={href} className="group">
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-800 mb-2">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={title}
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
                      {title}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate">
                      {year} • {item.mediaType === "tv" ? "Series" : "Movie"}
                    </p>
                  </Link>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                {currentPage > 1 && (
                  <Link
                    href={`/genre/${id}?page=${currentPage - 1}`}
                    className="rounded bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    ← Sebelumnya
                  </Link>
                )}
                {currentPage < totalPages && (
                  <Link
                    href={`/genre/${id}?page=${currentPage + 1}`}
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
