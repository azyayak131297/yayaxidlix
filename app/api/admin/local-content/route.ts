import { NextResponse } from "next/server"
import { loadLocalContent, saveLocalContent } from "@/lib/local-content"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const contents = loadLocalContent()
    return NextResponse.json({ data: contents })
  } catch (error) {
    console.error("Error fetching local content:", error)
    return NextResponse.json({ message: "Gagal memuat konten lokal" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, id, content } = body as {
      action: "upsert" | "delete"
      id?: string
      content?: {
        type: "movie" | "tv"
        title: string
        overview: string
        posterPath: string
        backdropPath: string
        releaseYear: number | null
        rating: number | null
        durationMinutes: number | null
        genres: string[]
        seasons: number | null
      }
    }

    const contents = loadLocalContent()

    if (action === "delete") {
      if (!id) {
        return NextResponse.json({ message: "ID wajib diisi untuk delete" }, { status: 400 })
      }
      const filtered = contents.filter((c) => c.id !== id)
      saveLocalContent(filtered)
      return NextResponse.json({ data: filtered, message: "Konten lokal berhasil dihapus" })
    }

    if (action === "upsert") {
      if (!content) {
        return NextResponse.json({ message: "Data konten wajib diisi" }, { status: 400 })
      }

      if (id && contents.some((c) => c.id === id)) {
        const index = contents.findIndex((c) => c.id === id)
        contents[index] = { ...contents[index], ...content }
      } else {
        const newId = `local-${Date.now()}`
        contents.push({ id: newId, ...content, viewCount: 0 })
      }

      saveLocalContent(contents)
      return NextResponse.json({ data: contents, message: "Konten lokal berhasil disimpan" })
    }

    return NextResponse.json({ message: "Action tidak dikenali" }, { status: 400 })
  } catch (error) {
    console.error("Error saving local content:", error)
    return NextResponse.json({ message: "Gagal menyimpan konten lokal" }, { status: 500 })
  }
}