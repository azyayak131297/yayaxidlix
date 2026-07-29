import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { name, email, password, confirmPassword } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Nama, email, dan password harus diisi" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ message: "Password dan konfirmasi password tidak cocok" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password minimal 6 karakter" }, { status: 400 })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { name },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json({ message: "Email atau nama pengguna sudah digunakan" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      message: "Registrasi berhasil",
      user,
    }, { status: 201 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ message: "Terjadi kesalahan saat registrasi" }, { status: 500 })
  }
}
