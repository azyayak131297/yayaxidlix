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

  const progresses = await prisma.videoProgress.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 10,
  })

  const items = progresses
    .filter((p) => p.progressSeconds > 0)
    .map((p) => ({
      contentId: p.contentId,
      contentType: p.contentType,
      episodeKey: p.episodeKey,
      progressSeconds: p.progressSeconds,
      durationSeconds: p.durationSeconds,
      updatedAt: p.updatedAt,
    }))

  return NextResponse.json({ data: items })
}