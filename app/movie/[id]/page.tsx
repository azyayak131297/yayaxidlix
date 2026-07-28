import { fetchMovieDetails, fetchTrending, fetchMovieCredits } from "@/lib/tmdb"
import { prisma } from "@/lib/prisma"
import { getVideoSource, loadVideoSources } from "@/lib/video-sources"
import { loadLocalContent, getLocalContentById } from "@/lib/local-content"
import { loadSiteSettings } from "@/lib/site-settings"
import { VideoPlayer } from "@/components/VideoPlayer"
import { VideoProgress } from "@/components/VideoProgress"
import { ContentRow } from "@/components/ContentRow"
import { Header } from "@/components/Header"
import { WatchlistToggle } from "@/components/WatchlistToggle"
import Image from "next/image"
import Link from "next/link"

type MoviePageProps = {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

async function getRelated() {
  const data = await fetchTrending()
  return data || []
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params
  const isCustomId = id.startsWith("custom-")
  const isLocalId = id.startsWith("local-")
  const videoSources = loadVideoSources()

  let movie: any = null
  let customId: string | undefined
  let localContent: any = null

  if (isCustomId) {
    customId = id
    movie = await prisma.customContent.findUnique({
      where: { id },
    })

    if (!movie) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Film tidak ditemukan</h1>
            <p className="text-zinc-400">Konten manual ini belum diisi atau telah dihapus.</p>
          </div>
        </div>
      )
    }
  } else if (isLocalId) {
    localContent = getLocalContentById(id)
    if (!localContent) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Film tidak ditemukan</h1>
            <p className="text-zinc-400">Konten lokal ini belum diisi di data/local-content.json.</p>
          </div>
        </div>
      )
    }
    movie = localContent
  } else {
    movie = await fetchMovieDetails(id)
    if (!movie) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Film tidak ditemukan</h1>
            <p className="text-zinc-400">ID film tidak valid atau TMDB API belum dikonfigurasi.</p>
            <p className="text-zinc-500 text-sm mt-2">Isi TMDB_API_KEY di .env atau gunakan konten custom.</p>
          </div>
        </div>
      )
    }
  }

  const videoSource = isCustomId
    ? videoSources.custom[customId as string] || null
    : isLocalId
      ? videoSources.custom[id] || null
      : getVideoSource("movie", movie.id)

  const related = await getRelated()
  const relatedFiltered = related
    .filter((item) => item.media_type === "movie")
    .filter((item) => isCustomId || isLocalId ? false : item.id !== movie.id)

  const isTmdb = !isCustomId && !isLocalId
  const title = movie.title || "Tanpa Judul"
  const posterPath = isTmdb ? movie.poster_path : movie.posterPath || ""
  const backdropPath = isTmdb ? movie.backdrop_path : movie.backdropPath || ""
  const releaseYear = isTmdb ? movie.release_date?.slice(0, 4) : movie.releaseYear ? String(movie.releaseYear) : ""
  const overview = movie.overview || ""
  const voteAverage = isTmdb ? movie.vote_average : movie.rating
  const durationMinutes = isTmdb ? movie.runtime : movie.durationMinutes
  const genres = isTmdb ? movie.genres || [] : (movie.genres || "").split(",").map((g: string) => g.trim()).filter(Boolean)

  const credits = isTmdb ? await fetchMovieCredits(id) : null
  const cast = credits?.cast?.slice(0, 12) || []
  const settings = loadSiteSettings()

  const watchHref = isCustomId ? `/watch/movie/${id}` : `/watch/movie/${movie.id}`
  const contentIdForWatchlist = isCustomId ? id : String(movie.id)

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="relative w-full h-[70vh]">
        {backdropPath ? (
          <Image
            src={isTmdb ? `https://image.tmdb.org/t/p/original${backdropPath}` : backdropPath}
            alt={title}
            fill
            className="object-cover opacity-60"
            priority
          />
        ) : (
          <div className="w-full h-full bg-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
            {posterPath ? (
              <div className="md:w-1/3 lg:w-1/4 flex-shrink-0">
                <Image
                  src={isTmdb ? `https://image.tmdb.org/t/p/w500${posterPath}` : posterPath}
                  alt={title}
                  width={300}
                  height={450}
                  className="rounded-lg shadow-2xl w-full"
                />
              </div>
            ) : null}
            <div className="flex-1 flex flex-col justify-end">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300 mb-6">
                {releaseYear && <span>{releaseYear}</span>}
                {durationMinutes && <span>{durationMinutes} menit</span>}
                {voteAverage !== undefined && voteAverage !== null && (
                  <span className="text-yellow-400 font-medium">⭐ {Number(voteAverage).toFixed(1)}</span>
                )}
              </div>
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {genres.map((genre: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-zinc-800 text-xs text-zinc-200">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={watchHref}
                  className="rounded bg-red-600 px-6 py-3 text-sm font-bold hover:bg-red-500 transition-colors"
                >
                  ▶ Tonton Film
                </Link>
                <WatchlistToggle contentId={contentIdForWatchlist} contentType="movie" />
              </div>
              <p className="text-zinc-300 text-lg leading-relaxed max-w-3xl mt-6">{overview}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {settings.features.showCast && !isCustomId && cast.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Pemeran</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {cast.map((person) => (
                <div key={person.id} className="flex-shrink-0 w-36 text-center">
                  <div className="relative aspect-square w-full overflow-hidden rounded-full bg-zinc-800 mb-2">
                    {person.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                        alt={person.name}
                        fill
                        className="object-cover"
                        sizes="144px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-500 text-2xl">👤</div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white truncate">{person.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{person.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {settings.features.showTrailer && !isCustomId && movie.videos?.results?.length ? (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Trailer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {movie.videos.results
                .filter((v: any) => v.type === "Trailer" && v.site === "YouTube")
                .slice(0, 2)
                .map((video: any) => (
                  <div key={video.id} className="aspect-video w-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.key}`}
                      title={video.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg"
                    />
                  </div>
                ))}
            </div>
          </section>
        ) : null}

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Putar Film</h2>
          <VideoProgress contentId={isCustomId ? customId || id : String(movie.id)} contentType="movie" source={videoSource} />
        </section>

        {!isCustomId && relatedFiltered.length > 0 && (
          <ContentRow
            title="Film Terkait"
            items={relatedFiltered}
            mediaType="movie"
          />
        )}
      </main>
    </div>
  )
}
