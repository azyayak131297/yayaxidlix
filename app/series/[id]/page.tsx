import { fetchSeriesDetails, fetchSeasonDetails, fetchTrending, fetchSeriesCredits } from "@/lib/tmdb"
import { prisma } from "@/lib/prisma"
import { getEpisodeVideoSource, loadVideoSources, type VideoSource } from "@/lib/video-sources"
import { getLocalContentById, loadLocalContent } from "@/lib/local-content"
import { loadSiteSettings } from "@/lib/site-settings"
import { VideoPlayer } from "@/components/VideoPlayer"
import { VideoProgress } from "@/components/VideoProgress"
import { ContentRow } from "@/components/ContentRow"
import { Header } from "@/components/Header"
import { WatchlistToggle } from "@/components/WatchlistToggle"
import Image from "next/image"
import Link from "next/link"

type SeriesPageProps = {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

type Season = {
  id: number
  name: string
  overview?: string
  season_number: number
  episode_count: number
  poster_path?: string | null
  episodes?: Array<{
    id: number
    name: string
    overview?: string
    episode_number: number
    season_number: number
    still_path?: string | null
    air_date?: string
  }>
}

async function getRelated() {
  const data = await fetchTrending()
  return data || []
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { id } = await params
  const isCustomId = id.startsWith("custom-")
  const isLocalId = id.startsWith("local-")
  const videoSources = loadVideoSources()

  let series: any = null
  let customId: string | undefined
  let localContent: any = null

  if (isCustomId) {
    customId = id
    series = await prisma.customContent.findUnique({
      where: { id },
    })

    if (!series) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Serial tidak ditemukan</h1>
            <p className="text-zinc-400">Konten manual ini belum diisi.</p>
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
            <h1 className="text-2xl font-bold mb-2">Serial tidak ditemukan</h1>
            <p className="text-zinc-400">Konten lokal ini belum diisi di data/local-content.json.</p>
          </div>
        </div>
      )
    }
    series = localContent
  } else {
    series = await fetchSeriesDetails(id)

    if (!series) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Serial tidak ditemukan</h1>
            <p className="text-zinc-400">ID serial tidak valid atau TMDB API belum dikonfigurasi.</p>
          </div>
        </div>
      )
    }
  }

  const related = await getRelated()
  const relatedFiltered = related
    .filter((item: any) => item.media_type === "tv")
    .filter((item: any) => isCustomId || isLocalId ? false : item.id !== series.id)

  const isTmdb = !isCustomId && !isLocalId
  const name = series.name || "Tanpa Judul"
  const posterPath = isTmdb ? series.poster_path : series.posterPath || ""
  const backdropPath = isTmdb ? series.backdrop_path : series.backdropPath || ""
  const releaseYear = isTmdb ? series.first_air_date?.slice(0, 4) : series.releaseYear ? String(series.releaseYear) : ""
  const overview = series.overview || ""
  const voteAverage = isTmdb ? series.vote_average : series.rating
  const seasonsCount = isTmdb ? series.number_of_seasons : series.seasons
  const rawSeasons = isTmdb ? series.seasons || [] : []
  const seasons = rawSeasons.filter((s: any) => s.season_number > 0)

  const firstSeason = seasons[0] || null
  const selectedSeasonNumber = firstSeason?.season_number || 1
  const seasonDetails: Season | null = isTmdb
    ? (await fetchSeasonDetails(series.id, selectedSeasonNumber)) || null
    : null

  const watchHref = isCustomId ? `/watch/tv/${id}` : `/watch/tv/${series.id}`
  const contentIdForWatchlist = isCustomId ? id : String(series.id)
  const credits = isTmdb ? await fetchSeriesCredits(id) : null
  const cast = credits?.cast?.slice(0, 12) || []
  const settings = loadSiteSettings()

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="relative w-full h-[70vh]">
        {backdropPath ? (
          <Image
            src={isTmdb ? `https://image.tmdb.org/t/p/original${backdropPath}` : backdropPath}
            alt={name}
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
                  alt={name}
                  width={300}
                  height={450}
                  className="rounded-lg shadow-2xl w-full"
                />
              </div>
            ) : null}
            <div className="flex-1 flex flex-col justify-end">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300 mb-6">
                {releaseYear && <span>{releaseYear}</span>}
                {seasonsCount && <span>{seasonsCount} Musim</span>}
                {voteAverage !== undefined && voteAverage !== null && (
                  <span className="text-yellow-400 font-medium">⭐ {Number(voteAverage).toFixed(1)}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                <Link
                  href={watchHref}
                  className="rounded bg-red-600 px-6 py-3 text-sm font-bold hover:bg-red-500 transition-colors"
                >
                  ▶ Tonton Serial
                </Link>
                <WatchlistToggle contentId={contentIdForWatchlist} contentType="tv" />
              </div>
              <p className="text-zinc-300 text-lg leading-relaxed max-w-3xl">{overview}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {settings.features.showTrailer && isTmdb && series.videos?.results?.length ? (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Trailer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {series.videos.results
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

        {settings.features.showCast && isTmdb && cast.length > 0 && (
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

        {isTmdb && seasons.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Musim</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {seasons.map((season: any) => (
                <div
                  key={season.id}
                  className={`flex-shrink-0 w-48 p-4 rounded-lg border-2 transition-colors ${
                    season.season_number === selectedSeasonNumber
                      ? "border-red-500 bg-zinc-800"
                      : "border-zinc-700 bg-zinc-900"
                  }`}
                >
                  <h3 className="font-medium text-sm mb-1">Musim {season.season_number}</h3>
                  <p className="text-xs text-zinc-400">{season.episode_count} Episode</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {isTmdb && seasonDetails && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">
              Episode Musim {seasonDetails.season_number}
            </h2>
            <div className="space-y-3">
              {seasonDetails.episodes?.map((episode) => {
                const videoSource = getEpisodeVideoSource(
                  series.id,
                  seasonDetails.season_number,
                  episode.episode_number
                )

                return (
                  <details
                    key={episode.id}
                    className="group bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden"
                  >
                    <summary className="flex items-center gap-4 p-4 cursor-pointer hover:bg-zinc-800 transition-colors">
                      <div className="flex-shrink-0 w-20 h-14 bg-zinc-800 rounded overflow-hidden">
                        {episode.still_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w200${episode.still_path}`}
                            alt={episode.name}
                            width={80}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-zinc-100 truncate">
                          {episode.episode_number}. {episode.name}
                        </h3>
                        <p className="text-xs text-zinc-400 truncate">{episode.overview}</p>
                      </div>
                      <span className="text-zinc-500 group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <div className="px-4 pb-4 pt-2">
                      <VideoProgress
                        contentId={id}
                        contentType="tv"
                        episodeKey={`${id}_s${seasonDetails.season_number}e${episode.episode_number}`}
                        source={videoSource}
                      />
                    </div>
                  </details>
                )
              })}
            </div>
          </section>
        )}

        {!isTmdb && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Putar Serial</h2>
            <VideoProgress
              contentId={id}
              contentType="tv"
              source={videoSources.custom[customId || ""] || null}
            />
          </section>
        )}

        {relatedFiltered.length > 0 && (
          <ContentRow
            title="Serial Terkait"
            items={relatedFiltered}
            mediaType="tv"
          />
        )}
      </main>
    </div>
  )
}
