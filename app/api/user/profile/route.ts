import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id as string
    const { name, email } = await request.json()

    if (!name && !email) {
      return NextResponse.json({ message: "Nama atau email harus diisi" }, { status: 400 })
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      message: "Profil berhasil diperbarui",
      user,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ message: "Terjadi kesalahan saat memperbarui profil" }, { status: 500 })
  }
}
