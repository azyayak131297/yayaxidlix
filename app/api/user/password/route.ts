import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id as string
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Password saat ini dan password baru harus diisi" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: "Password baru minimal 6 karakter" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    })

    if (!user || !user.password) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 })
    }

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ message: "Password saat ini salah" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({
      message: "Password berhasil diubah",
    })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ message: "Terjadi kesalahan saat mengganti password" }, { status: 500 })
  }
}
