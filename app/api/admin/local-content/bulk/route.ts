import { NextResponse } from "next/server"
import { loadLocalContent, saveLocalContent } from "@/lib/local-content"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ids } = body as { ids: string[] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: "ID konten wajib diisi" }, { status: 400 })
    }

    const contents = loadLocalContent()
    const filtered = contents.filter((c) => !ids.includes(c.id))
    saveLocalContent(filtered)

    return NextResponse.json({ success: true, deletedCount: ids.length })
  } catch (error) {
    console.error("Bulk delete local error:", error)
    return NextResponse.json({ message: "Gagal menghapus konten lokal" }, { status: 500 })
  }
}