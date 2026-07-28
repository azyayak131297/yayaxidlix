import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

export interface LocalContent {
  id: string
  type: "movie" | "tv"
  title: string
  overview: string
  posterPath: string
  backdropPath: string
  releaseYear: number | null
  rating: number | null
  durationMinutes: number | null
  genres: string[]
  seasons: number | null
  viewCount: number
}

let cachedContent: LocalContent[] = []

function getLocalContentPath() {
  return join(process.cwd(), "data", "local-content.json")
}

export function loadLocalContent(): LocalContent[] {
  try {
    const content = readFileSync(getLocalContentPath(), "utf-8")
    const data = JSON.parse(content)
    cachedContent = data.contents || []
    return cachedContent
  } catch {
    return cachedContent
  }
}

export function saveLocalContent(contents: LocalContent[]) {
  try {
    const data = { formatVersion: "1.0", contents }
    writeFileSync(getLocalContentPath(), JSON.stringify(data, null, 2), "utf-8")
    cachedContent = contents
    return true
  } catch {
    return false
  }
}

export function incrementLocalViewCount(id: string) {
  try {
    const contents = loadLocalContent()
    const index = contents.findIndex((c) => c.id === id)
    if (index >= 0) {
      contents[index] = { ...contents[index], viewCount: (contents[index].viewCount || 0) + 1 }
      saveLocalContent(contents)
    }
  } catch {
    // ignore
  }
}

export function getLocalContentById(id: string): LocalContent | undefined {
  return loadLocalContent().find((c) => c.id === id)
}