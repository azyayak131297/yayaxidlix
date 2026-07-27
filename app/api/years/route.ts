import { NextResponse } from "next/server"
import { fetchYears } from "@/lib/tmdb"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const years = await fetchYears()
    return NextResponse.json({ data: years })
  } catch (error) {
    console.error("Error fetching years:", error)
    return NextResponse.json({ data: [] })
  }
}
