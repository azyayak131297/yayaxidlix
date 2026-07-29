import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ids } = body as { ids: string[] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: "ID konten wajib diisi" }, { status: 400 })
    }

    const result = await prisma.customContent.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    return NextResponse.json({ success: true, deletedCount: result.count })
  } catch (error) {
    console.error("Bulk delete error:", error)
    return NextResponse.json({ message: "Gagal menghapus konten" }, { status: 500 })
  }
}