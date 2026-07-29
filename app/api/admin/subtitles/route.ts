import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

function convertSrtToVtt(srtContent: string): string {
  const lines = srtContent.split("\n")
  const vttLines = ["WEBVTT", ""]
  let skipNextEmpty = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (skipNextEmpty && line === "") {
      skipNextEmpty = false
      continue
    }
    if (/^\d+$/.test(line)) {
      skipNextEmpty = true
      continue
    }
    if (line.includes("-->")) {
      vttLines.push(line.replace(/,(\d{3})$/, ".$1"))
      continue
    }
    vttLines.push(line)
  }

  return vttLines.join("\n")
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const contentType = request.headers.get("content-type") || ""
    let contentId: string
    let contentTypeValue: string
    let episodeKey: string | undefined
    let language: string
    let label: string
    let format: string
    let isDefault: boolean
    let url: string

    if (contentType.includes("application/json")) {
      const body = await request.json()
      contentId = body.contentId
      contentTypeValue = body.contentType
      episodeKey = body.episodeKey
      language = body.language
      label = body.label
      format = body.format || "vtt"
      isDefault = body.isDefault || false
      url = body.url

      if (!contentId || !contentTypeValue || !language || !label || !url) {
        return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 })
      }
    } else {
      const formData = await request.formData()
      contentId = formData.get("contentId") as string
      contentTypeValue = formData.get("contentType") as string
      episodeKey = (formData.get("episodeKey") as string) || undefined
      language = formData.get("language") as string
      label = formData.get("label") as string
      format = (formData.get("format") as string) || "vtt"
      isDefault = formData.get("isDefault") === "true"
      const file = formData.get("file") as File | null

      if (!contentId || !contentTypeValue || !language || !label) {
        return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 })
      }

      if (file) {
        const fileText = await file.text()
        url = `/api/subtitles/file/${contentId}-${language}-${Date.now()}.${format}`

        const fs = await import("node:fs/promises")
        const path = await import("node:path")
        const subtitlesDir = path.join(process.cwd(), "public", "subtitles")

        try {
          await fs.mkdir(subtitlesDir, { recursive: true })
        } catch {
          // ignore
        }

        const filename = `${contentId}-${language}-${Date.now()}.${format}`
        const filePath = path.join(subtitlesDir, filename)
        const content = format === "srt" ? convertSrtToVtt(fileText) : fileText
        await fs.writeFile(filePath, content, "utf-8")
        url = `/subtitles/${filename}`
      } else {
        return NextResponse.json({ message: "File subtitle wajib diunggah" }, { status: 400 })
      }
    }

    const subtitle = await prisma.subtitle.create({
      data: {
        contentId,
        contentType: contentTypeValue,
        episodeKey,
        language,
        label,
        url,
        format,
        isDefault,
      },
    })

    return NextResponse.json({ data: subtitle }, { status: 201 })
  } catch (error) {
    console.error("Error creating subtitle:", error)
    return NextResponse.json({ message: "Gagal menambahkan subtitle" }, { status: 500 })
  }
}
