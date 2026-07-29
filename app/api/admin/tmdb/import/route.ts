import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { fetchMovieDetails, fetchSeriesDetails } from "@/lib/tmdb"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items } = body as { items: Array<{ tmdbId: number; mediaType: "movie" | "tv"; title: string; posterPath?: string; backdropPath?: string; overview?: string; releaseYear?: number; rating?: number; durationMinutes?: number; seasons?: number }> }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Daftar konten kosong" }, { status: 400 })
    }

    const results = []

    for (const item of items) {
      let details: any = null

      if (item.mediaType === "movie") {
        details = await fetchMovieDetails(item.tmdbId)
        if (details) {
          const existing = await prisma.customContent.findFirst({
            where: {
              OR: [
                { id: `tmdb-movie-${item.tmdbId}` },
              ],
            },
          })

          if (!existing) {
            const content = await prisma.customContent.create({
              data: {
                id: `tmdb-movie-${item.tmdbId}`,
                title: details.title || item.title,
                overview: details.overview || item.overview || "",
                posterPath: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : item.posterPath || "",
                backdropPath: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : item.backdropPath || "",
                releaseYear: details.release_date ? parseInt(details.release_date.slice(0, 4), 10) : item.releaseYear || 0,
                rating: details.vote_average || item.rating || 0,
                durationMinutes: details.runtime || item.durationMinutes || 0,
                genres: details.genres?.map((g: any) => g.name).join(",") || "",
                type: "movie",
                seasons: null,
              },
            })
            results.push({ success: true, id: content.id, title: content.title })
          } else {
            results.push({ success: false, id: existing.id, title: existing.title, reason: "Already exists" })
          }
        }
      } else if (item.mediaType === "tv") {
        details = await fetchSeriesDetails(item.tmdbId)
        if (details) {
          const existing = await prisma.customContent.findFirst({
            where: {
              OR: [
                { id: `tmdb-series-${item.tmdbId}` },
              ],
            },
          })

          if (!existing) {
            const content = await prisma.customContent.create({
              data: {
                id: `tmdb-series-${item.tmdbId}`,
                title: details.name || item.title,
                overview: details.overview || item.overview || "",
                posterPath: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : item.posterPath || "",
                backdropPath: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : item.backdropPath || "",
                releaseYear: details.first_air_date ? parseInt(details.first_air_date.slice(0, 4), 10) : item.releaseYear || 0,
                rating: details.vote_average || item.rating || 0,
                durationMinutes: 0,
                genres: details.genres?.map((g: any) => g.name).join(",") || "",
                type: "tv",
                seasons: details.number_of_seasons || item.seasons || 1,
              },
            })
            results.push({ success: true, id: content.id, title: content.title })
          } else {
            results.push({ success: false, id: existing.id, title: existing.title, reason: "Already exists" })
          }
        }
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      message: `Batch import completed: ${successCount} imported, ${failCount} skipped`,
      results,
      summary: { success: successCount, failed: failCount, total: items.length },
    })
  } catch (error) {
    console.error("Error batch importing TMDB:", error)
    return NextResponse.json({ message: "Gagal melakukan batch import" }, { status: 500 })
  }
}
