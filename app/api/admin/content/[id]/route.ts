import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, overview, posterPath, backdropPath, releaseYear, rating, durationMinutes, genres, type, seasons } = body

    const data: any = { title, overview, posterPath, backdropPath, genres, type }
    if (releaseYear !== undefined) data.releaseYear = releaseYear ? Number(releaseYear) : null
    if (rating !== undefined) data.rating = rating ? Number(rating) : null
    if (durationMinutes !== undefined) data.durationMinutes = durationMinutes ? Number(durationMinutes) : null
    if (seasons !== undefined) data.seasons = seasons ? Number(seasons) : null

    const updated = await prisma.customContent.update({ where: { id }, data })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error("Failed to update custom content", error)
    return NextResponse.json({ error: "Gagal memperbarui konten" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.customContent.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete custom content", error)
    return NextResponse.json({ error: "Gagal menghapus konten" }, { status: 500 })
  }
}