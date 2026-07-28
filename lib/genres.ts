import { readFileSync } from "node:fs"
import { join } from "node:path"

export interface Genre {
  id: number
  name: string
  imageUrl?: string
}

let cachedGenres: Genre[] = []

function getGenresPath() {
  return join(process.cwd(), "data", "genres.json")
}

export function loadGenres(): Genre[] {
  try {
    const content = readFileSync(getGenresPath(), "utf-8")
    const data = JSON.parse(content)
    cachedGenres = data.genres || []
    return cachedGenres
  } catch {
    return cachedGenres
  }
}

export function getGenreNames(ids: number[]): string[] {
  const genres = loadGenres()
  return ids.map((id) => genres.find((g) => g.id === id)?.name || String(id))
}

export function getGenreIdByName(name: string): number | undefined {
  const genres = loadGenres()
  const found = genres.find((g) => g.name.toLowerCase() === name.toLowerCase())
  return found?.id
}

export function parseGenreInput(input: string): number[] {
  const names = input.split(",").map((s) => s.trim()).filter(Boolean)
  const genres = loadGenres()
  const ids: number[] = []

  for (const name of names) {
    const found = genres.find((g) => g.name.toLowerCase() === name.toLowerCase())
    if (found) {
      ids.push(found.id)
    } else {
      const num = Number(name)
      if (!Number.isNaN(num)) {
        ids.push(num)
      }
    }
  }

  return ids
}