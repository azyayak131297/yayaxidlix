import { NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import { join } from "node:path"
import { invalidateVideoSourcesCache } from "@/lib/video-sources"

const VIDEO_SOURCES_PATH = join(process.cwd(), "data", "video-sources.json")

type VideoSource = {
  type: "archive" | "youtube" | "vimeo" | "direct"
  url: string
  label?: string
  quality?: string
}

type VideoSourcesData = {
  formatVersion: string
  movies: Record<string, VideoSource>
  series: {
    episodes: Record<string, VideoSource>
  }
  custom: Record<string, VideoSource>
  defaults: {
    enabledSources: string[]
    autoPlay: boolean
  }
}

async function readVideoSources(): Promise<VideoSourcesData> {
  try {
    const content = await fs.readFile(VIDEO_SOURCES_PATH, "utf-8")
    return JSON.parse(content) as VideoSourcesData
  } catch {
    return {
      formatVersion: "1.0",
      movies: {},
      series: { episodes: {} },
      custom: {},
      defaults: {
        enabledSources: ["archive", "youtube", "vimeo", "direct"],
        autoPlay: false,
      },
    }
  }
}

async function writeVideoSources(data: VideoSourcesData) {
  await fs.writeFile(VIDEO_SOURCES_PATH, JSON.stringify(data, null, 2), "utf-8")
}

export async function GET() {
  try {
    const data = await readVideoSources()
    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error reading video sources:", error)
    return NextResponse.json({ message: "Gagal memuat video sources" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, key, contentType, source } = body as {
      action: "upsert" | "delete" | "upsert-episode"
      key?: string
      contentType?: "movie" | "tv"
      source?: VideoSource
    }

    const data = await readVideoSources()

    if (action === "delete") {
      if (!key) {
        return NextResponse.json({ message: "Key wajib diisi untuk delete" }, { status: 400 })
      }
      delete data.custom[key]
      if (data.movies[key]) delete data.movies[key]
      if (data.series.episodes[key]) delete data.series.episodes[key]
    } else if (action === "upsert" || action === "upsert-episode") {
      if (!key || !source) {
        return NextResponse.json({ message: "Key dan source wajib diisi" }, { status: 400 })
      }
      if (contentType === "movie") {
        data.movies[key] = source
      } else if (action === "upsert-episode") {
        data.series.episodes[key] = source
      } else {
        data.custom[key] = source
      }
    } else {
      return NextResponse.json({ message: "Action tidak dikenali" }, { status: 400 })
    }

    await writeVideoSources(data)
    invalidateVideoSourcesCache()
    return NextResponse.json({ data, message: "Video source berhasil disimpan" })
  } catch (error) {
    console.error("Error saving video source:", error)
    return NextResponse.json({ message: "Gagal menyimpan video source" }, { status: 500 })
  }
}
