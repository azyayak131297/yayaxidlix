import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const customContent = await prisma.customContent.create({
      data: {
        title: body.title,
        overview: body.overview,
        posterPath: body.posterPath,
        backdropPath: body.backdropPath,
        releaseYear: body.releaseYear,
        rating: body.rating,
        durationMinutes: body.durationMinutes,
        genres: body.genres,
        type: body.type,
        seasons: body.seasons,
      },
    })

    return NextResponse.json(
      {
        id: customContent.id,
        message: "Konten berhasil disimpan",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating custom content:", error)
    return NextResponse.json(
      { message: "Gagal menyimpan konten" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const contents = await prisma.customContent.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ data: contents })
  } catch (error) {
    console.error("Error fetching custom content:", error)
    return NextResponse.json(
      { message: "Gagal memuat daftar konten" },
      { status: 500 }
    )
  }
}
