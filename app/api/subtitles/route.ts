import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get("contentId")
    const contentType = searchParams.get("contentType")
    const episodeKey = searchParams.get("episodeKey") || undefined

    if (!contentId || !contentType) {
      return NextResponse.json({ message: "contentId dan contentType wajib diisi" }, { status: 400 })
    }

    const subtitles = await prisma.subtitle.findMany({
      where: {
        contentId,
        contentType,
        episodeKey: episodeKey || null,
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ data: subtitles })
  } catch (error) {
    console.error("Error fetching subtitles:", error)
    return NextResponse.json({ message: "Gagal memuat subtitle" }, { status: 500 })
  }
}
