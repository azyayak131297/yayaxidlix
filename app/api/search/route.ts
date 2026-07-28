import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { searchTmdb } from "@/lib/tmdb"
import { loadLocalContent } from "@/lib/local-content"

export const dynamic = "force-dynamic"

type SearchResult = {
  id: string
  title: string
  posterPath?: string | null
  backdropPath?: string | null
  releaseYear?: number | null
  type: "movie" | "tv" | "custom"
  source: "tmdb" | "custom"
  overview?: string | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()

  if (!query) {
    return NextResponse.json({ data: [] })
  }

  const results: SearchResult[] = []

  try {
    const [tmdbResults, customResults, localResults] = await Promise.all([
      searchTmdb(query),
      prisma.customContent.findMany({
        where: {
          title: {
            contains: query,
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      Promise.resolve(loadLocalContent()),
    ])

    for (const item of tmdbResults) {
      results.push({
        id: String(item.id),
        title: item.title || item.name || "Untitled",
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        releaseYear: item.release_date || item.first_air_date ? new Date(item.release_date || item.first_air_date || "").getFullYear() : null,
        type: item.media_type === "tv" ? "tv" : "movie",
        source: "tmdb",
        overview: item.overview,
      })
    }

    for (const item of customResults) {
      results.push({
        id: item.id,
        title: item.title,
        posterPath: item.posterPath,
        backdropPath: item.backdropPath,
        releaseYear: item.releaseYear,
        type: item.type as "movie" | "tv",
        source: "custom",
        overview: item.overview,
      })
    }

    for (const item of localResults) {
      if (item.title.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          id: item.id,
          title: item.title,
          posterPath: item.posterPath,
          backdropPath: item.backdropPath,
          releaseYear: item.releaseYear,
          type: item.type as "movie" | "tv",
          source: "custom",
          overview: item.overview,
        })
      }
    }

    return NextResponse.json({ data: results })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ data: [] })
  }
}
