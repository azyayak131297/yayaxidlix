import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) {
    return NextResponse.json({ data: [] })
  }

  const { searchParams } = new URL(request.url)
  const contentId = searchParams.get("contentId")
  const contentType = searchParams.get("contentType")

  if (!contentId || !contentType) {
    return NextResponse.json({ data: [] })
  }

  const progress = await prisma.videoProgress.findFirst({
    where: { userId, contentId, contentType },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json({ data: progress })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { contentId, contentType, episodeKey, progressSeconds, durationSeconds } = body as {
      contentId: string
      contentType: string
      episodeKey?: string
      progressSeconds: number
      durationSeconds: number
    }

    if (!contentId || !contentType || progressSeconds === undefined || durationSeconds === undefined) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 })
    }

    const existing = await prisma.videoProgress.findFirst({
      where: { userId, contentId, contentType, episodeKey: episodeKey || "" },
    })

    if (existing) {
      await prisma.videoProgress.update({
        where: { id: existing.id },
        data: { progressSeconds, durationSeconds },
      })
    } else {
      await prisma.videoProgress.create({
        data: { userId, contentId, contentType, episodeKey: episodeKey || "", progressSeconds, durationSeconds },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving progress:", error)
    return NextResponse.json({ message: "Gagal menyimpan progress" }, { status: 500 })
  }
}