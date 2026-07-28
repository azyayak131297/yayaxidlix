import { NextResponse } from "next/server"
import { writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ message: "File wajib diupload" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF." }, { status: 400 })
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ message: "Ukuran file terlalu besar. Maksimal 5MB." }, { status: 400 })
    }

    const uploadsDir = join(process.cwd(), "public", "uploads")
    mkdirSync(uploadsDir, { recursive: true })

    const ext = file.name.split(".").pop() || "jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`
    const filepath = join(uploadsDir, filename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    writeFileSync(filepath, buffer)

    const publicUrl = `/uploads/${filename}`

    return NextResponse.json({ url: publicUrl, filename })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ message: "Gagal mengupload file" }, { status: 500 })
  }
}