import { NextResponse } from "next/server"
import { fetchGenres } from "@/lib/tmdb"
import { loadGenres } from "@/lib/genres"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const tmdbGenres = await fetchGenres()
    if (tmdbGenres.length > 0) {
      return NextResponse.json({ data: tmdbGenres })
    }
  } catch {
    // fallback to local genres
  }

  const localGenres = loadGenres()
  return NextResponse.json({ data: localGenres })
}
