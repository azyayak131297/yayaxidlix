import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const contents = await prisma.customContent.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    })
    return NextResponse.json({ data: contents })
  } catch (err) {
    console.error("Failed to load custom content:", err)
    return NextResponse.json({ data: [] })
  }
}
