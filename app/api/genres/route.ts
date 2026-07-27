import { NextResponse } from "next/server"
import { fetchGenres } from "@/lib/tmdb"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const genres = await fetchGenres()
    return NextResponse.json({ data: genres })
  } catch (error) {
    console.error("Error fetching genres:", error)
    return NextResponse.json({ data: [] })
  }
}
