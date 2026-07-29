import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { promises as fs } from "node:fs"
import { join } from "node:path"

export const dynamic = "force-dynamic"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { language, label, isDefault } = body

    const subtitle = await prisma.subtitle.update({
      where: { id },
      data: {
        language,
        label,
        isDefault,
      },
    })

    return NextResponse.json({ data: subtitle })
  } catch (error) {
    console.error("Error updating subtitle:", error)
    return NextResponse.json({ message: "Gagal memperbarui subtitle" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const subtitle = await prisma.subtitle.findUnique({
      where: { id },
    })

    if (!subtitle) {
      return NextResponse.json({ message: "Subtitle tidak ditemukan" }, { status: 404 })
    }

    if (subtitle.url.startsWith("/subtitles/")) {
      const filename = subtitle.url.replace("/subtitles/", "")
      const filePath = join(process.cwd(), "public", "subtitles", filename)
      try {
        await fs.unlink(filePath)
      } catch {
        // ignore
      }
    }

    await prisma.subtitle.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Subtitle berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting subtitle:", error)
    return NextResponse.json({ message: "Gagal menghapus subtitle" }, { status: 500 })
  }
}
