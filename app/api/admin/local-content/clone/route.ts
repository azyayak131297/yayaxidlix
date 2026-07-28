import { NextResponse } from "next/server"
import { loadLocalContent, saveLocalContent } from "@/lib/local-content"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id } = body as { id: string }

    if (!id) {
      return NextResponse.json({ message: "ID wajib diisi" }, { status: 400 })
    }

    const contents = loadLocalContent()
    const original = contents.find((c) => c.id === id)

    if (!original) {
      return NextResponse.json({ message: "Konten tidak ditemukan" }, { status: 404 })
    }

    const newId = `local-${Date.now()}`
    const cloned = {
      ...original,
      id: newId,
      title: `${original.title} (Copy)`,
      viewCount: 0,
    }

    const updated = [...contents, cloned]
    saveLocalContent(updated)

    return NextResponse.json({ data: cloned })
  } catch (error) {
    console.error("Failed to clone local content:", error)
    return NextResponse.json({ message: "Gagal menggandakan konten lokal" }, { status: 500 })
  }
}