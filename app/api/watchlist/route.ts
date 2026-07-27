import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) {
    return NextResponse.json({ data: [] })
  }
  const items = await prisma.watchlist.findMany({
    where: { userId },
    select: { contentId: true, contentType: true }
  })
  return NextResponse.json({ data: items })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { contentId, contentType } = body as { contentId: string; contentType: string }
    if (!contentId || !contentType) {
      return NextResponse.json({ message: "contentId dan contentType wajib diisi" }, { status: 400 })
    }
    const existing = await prisma.watchlist.findFirst({
      where: { userId, contentId, contentType }
    })
    if (existing) {
      await prisma.watchlist.delete({ where: { id: existing.id } })
      return NextResponse.json({ data: { removed: true } })
    } else {
      const item = await prisma.watchlist.create({
        data: { userId, contentId, contentType }
      })
      return NextResponse.json({ data: { removed: false, item } })
    }
  } catch (error) {
    console.error("Error toggling watchlist:", error)
    return NextResponse.json({ message: "Gagal memperbarui watchlist" }, { status: 500 })
  }
}