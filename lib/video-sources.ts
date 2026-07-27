import { readFileSync } from "node:fs"
import { join } from "node:path"

export interface VideoSource {
  type: "archive" | "youtube" | "vimeo" | "direct"
  url: string
  label?: string
  quality?: string
}

export interface VideoSourcesData {
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

let cachedSources: VideoSourcesData | null = null

export function invalidateVideoSourcesCache() {
  cachedSources = null
}

function getVideoSourcesPath() {
  return join(process.cwd(), "data", "video-sources.json")
}

export function loadVideoSources(): VideoSourcesData {
  if (cachedSources) return cachedSources

  try {
    const content = readFileSync(getVideoSourcesPath(), "utf-8")
    cachedSources = JSON.parse(content) as VideoSourcesData
    return cachedSources
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

export function getVideoSource(
  mediaType: "movie" | "tv",
  tmdbId?: string | number,
  customId?: string
): VideoSource | null {
  const data = loadVideoSources()

  if (customId) {
    return data.custom[customId] || null
  }

  if (!tmdbId) return null

  const idStr = String(tmdbId)

  if (mediaType === "movie") {
    return data.movies[idStr] || null
  }

  return null
}

export function getEpisodeVideoSource(
  seriesId: string | number,
  seasonNumber: number,
  episodeNumber: number,
  customEpisodeId?: string
): VideoSource | null {
  const data = loadVideoSources()

  if (customEpisodeId) {
    return data.custom[customEpisodeId] || null
  }

  const key = `${seriesId}_s${seasonNumber}e${episodeNumber}`
  return data.series.episodes[key] || null
}

export function resolveEmbedUrl(source: VideoSource): string {
  switch (source.type) {
    case "archive": {
      const match = source.url.match(/archive\.org\/details\/([^?&]+)/)
      if (match) {
        return `https://archive.org/embed/${match[1]}`
      }
      return `https://archive.org/embed/${source.url}`
    }
    case "youtube": {
      const videoIdMatch = source.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^?&]+)/)
      if (videoIdMatch) {
        return `https://www.youtube.com/embed/${videoIdMatch[1]}`
      }
      return source.url
    }
    case "vimeo": {
      const vimeoMatch = source.url.match(/vimeo\.com\/(\d+)/)
      if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`
      }
      return source.url
    }
    case "direct":
    default:
      return source.url
  }
}
