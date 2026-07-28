import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { incrementLocalViewCount } from "@/lib/local-content"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contentId, contentType } = body as { contentId: string; contentType: string }

    if (!contentId || !contentType) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 })
    }

    if (contentId.startsWith("local-")) {
      incrementLocalViewCount(contentId)
    } else if (!contentId.startsWith("custom-")) {
      await prisma.customContent.updateMany({
        where: { id: contentId },
        data: { viewCount: { increment: 1 } },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking view:", error)
    return NextResponse.json({ message: "Gagal mencatat view" }, { status: 500 })
  }
}