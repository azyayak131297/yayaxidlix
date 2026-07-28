import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const original = await prisma.customContent.findUnique({
      where: { id },
      select: {
        title: true,
        overview: true,
        posterPath: true,
        backdropPath: true,
        releaseYear: true,
        rating: true,
        durationMinutes: true,
        genres: true,
        type: true,
        seasons: true,
      },
    })

    if (!original) {
      return NextResponse.json({ message: "Konten tidak ditemukan" }, { status: 404 })
    }

    const cloned = await prisma.customContent.create({
      data: {
        ...original,
        title: `${original.title} (Copy)`,
        id: undefined,
      },
    })

    return NextResponse.json({ data: cloned })
  } catch (error) {
    console.error("Failed to clone content:", error)
    return NextResponse.json({ message: "Gagal menggandakan konten" }, { status: 500 })
  }
}