import { fetchMovieDetails, fetchSeriesDetails, fetchTrending } from "@/lib/tmdb"
import { prisma } from "@/lib/prisma"
import { loadVideoSources, getVideoSource, getEpisodeVideoSource } from "@/lib/video-sources"
import { getLocalContentById } from "@/lib/local-content"
import { VideoPlayer } from "@/components/VideoPlayer"
import { VideoProgress } from "@/components/VideoProgress"
import { ContentRow } from "@/components/ContentRow"
import { Header } from "@/components/Header"
import Image from "next/image"
import Link from "next/link"

type WatchPageProps = {
  params: Promise<{ type: string; id: string }>
}

export const dynamic = "force-dynamic"

async function fetchContent(type: string, id: string) {
  const isCustomId = id.startsWith("custom-")
  const isLocalId = id.startsWith("local-")

  if (isCustomId) {
    const custom = await prisma.customContent.findUnique({ where: { id } })
    if (!custom) return null
    return { ...custom, isCustom: true, mediaType: custom.type }
  }

  if (isLocalId) {
    const local = getLocalContentById(id)
    if (!local) return null
    return { ...local, isCustom: true, mediaType: local.type }
  }

  if (type === "movie") {
    const movie = await fetchMovieDetails(id)
    return movie ? { ...movie, isCustom: false, mediaType: "movie" } : null
  } else if (type === "series") {
    const series = await fetchSeriesDetails(id)
    return series ? { ...series, isCustom: false, mediaType: "tv" } : null
  }

  return null
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { type, id } = await params
  const content = await fetchContent(type, id)

  if (!content) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-2xl font-bold mb-2">Konten tidak ditemukan</h1>
          <p className="text-zinc-400">Konten yang Anda cari tidak tersedia.</p>
          <Link href="/" className="text-red-400 hover:underline mt-4 inline-block">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    )
  }

  const subtitles = await prisma.subtitle.findMany({
    where: { contentId: id, contentType: type as "movie" | "tv" },
    orderBy: { createdAt: "asc" },
  })

  const isCustom = content.isCustom
  const mediaType = content.mediaType as string
  const isMovie = mediaType === "movie"
  const isSeries = mediaType === "tv"
  const title = (content as any).title || (content as any).name || "Tanpa Judul"
  const posterPath = isCustom
    ? (content as any).posterPath || ""
    : ((content as any).poster_path || "")
  const backdropPath = isCustom
    ? (content as any).backdropPath || ""
    : ((content as any).backdrop_path || "")
  const releaseYear = isCustom
    ? ((content as any).releaseYear ? String((content as any).releaseYear) : "")
    : (isMovie
        ? (content as any).release_date?.slice(0, 4)
        : (content as any).first_air_date?.slice(0, 4))
  const overview = (content as any).overview || ""
  const voteAverage = isCustom
    ? (content as any).rating
    : (isMovie ? (content as any).vote_average : (content as any).vote_average)
  const durationMinutes = isCustom
    ? (content as any).durationMinutes
    : (isMovie ? (content as any).runtime : undefined)
  const genres = isCustom
    ? (Array.isArray((content as any).genres)
        ? ((content as any).genres as string[])
        : String((content as any).genres || "").split(",").map((g: string) => g.trim()).filter(Boolean))
    : ((content as any).genres || [])
  const seasons = isCustom
    ? (content as any).seasons
    : (isMovie ? undefined : (content as any).number_of_seasons)

  const videoSources = loadVideoSources()
  const contentId = (content as any).id
  const videoSource = isCustom
    ? videoSources.custom[id] || null
    : (isMovie
        ? getVideoSource("movie", contentId)
        : getVideoSource("tv", contentId))

  const related = await fetchTrending()
  const relatedFiltered = (related || [])
    .filter((item: any) => isMovie ? item.media_type === "movie" : item.media_type === "tv")
    .filter((item: any) => isCustom ? false : item.id !== contentId)

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
        <div className="relative w-full aspect-video max-h-[70vh] overflow-hidden rounded-lg bg-zinc-900 mb-8 mt-6">
          {backdropPath && isCustom ? (
            <Image
              src={backdropPath}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          ) : backdropPath ? (
            <Image
              src={`https://image.tmdb.org/t/p/original${backdropPath}`}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-pulse" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="flex gap-3 mb-4">
              {isMovie && (
                <span className="px-3 py-1 rounded bg-red-600 text-xs font-bold uppercase tracking-wider">Film</span>
              )}
              {!isMovie && (
                <span className="px-3 py-1 rounded bg-blue-600 text-xs font-bold uppercase tracking-wider">Series</span>
              )}
              {releaseYear && (
                <span className="px-3 py-1 rounded bg-zinc-800 text-xs text-zinc-300">{releaseYear}</span>
              )}
              {voteAverage !== undefined && voteAverage !== null && (
                <span className="px-3 py-1 rounded bg-yellow-500/20 text-xs text-yellow-400 font-medium">
                  ⭐ {Number(voteAverage).toFixed(1)}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-3">{title}</h1>
            {durationMinutes && (
              <p className="text-zinc-300 text-sm mb-2">{durationMinutes} menit</p>
            )}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.map((genre: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 rounded bg-zinc-800 text-xs text-zinc-300">
                    {genre}
                  </span>
                ))}
              </div>
            )}
            <p className="text-zinc-200 text-sm md:text-base max-w-3xl line-clamp-3">{overview}</p>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">▶ Putar Sekarang</h2>
          <div className="rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
            <VideoProgress contentId={id} contentType={type as "movie" | "tv"} episodeKey={isSeries ? `${id}_s1e1` : undefined} source={videoSource} poster={backdropPath || posterPath || undefined} subtitles={subtitles.map((s) => ({ id: s.id, language: s.language, label: s.label, url: s.url, isDefault: s.isDefault }))} />
          </div>
        </section>

        {seasons && seasons > 1 && !isCustom && !isMovie && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Musim</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {Array.from({ length: Math.min(seasons, 4) }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-40 p-4 rounded-lg border border-zinc-700 bg-zinc-900 text-center hover:border-red-500 transition-colors cursor-pointer"
                >
                  <h3 className="font-medium text-sm">Musim {i + 1}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{i + 1} Episodes</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {relatedFiltered.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{isMovie ? "Film Terkait" : "Serial Terkait"}</h2>
            <ContentRow title="" items={relatedFiltered} mediaType={isMovie ? "movie" : "tv"} />
          </section>
        )}
      </main>
    </div>
  )
}