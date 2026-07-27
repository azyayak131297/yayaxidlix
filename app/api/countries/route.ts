import { NextResponse } from "next/server"
import { fetchCountries } from "@/lib/tmdb"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const countries = await fetchCountries()
    return NextResponse.json({ data: countries })
  } catch (error) {
    console.error("Error fetching countries:", error)
    return NextResponse.json({ data: [] })
  }
}
