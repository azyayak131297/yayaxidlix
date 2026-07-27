import { NextResponse } from "next/server"
import { fetchNetworks } from "@/lib/tmdb"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const networks = await fetchNetworks()
    return NextResponse.json({ data: networks })
  } catch (error) {
    console.error("Error fetching networks:", error)
    return NextResponse.json({ data: [] })
  }
}
