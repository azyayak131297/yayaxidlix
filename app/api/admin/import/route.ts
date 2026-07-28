import { NextResponse } from "next/server"
import { loadLocalContent, saveLocalContent } from "@/lib/local-content"
import { parseGenreInput } from "@/lib/genres"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ message: "File wajib diupload" }, { status: 400 })
    }

    const text = await file.text()
    let imported: any[] = []

    const trimmed = text.trim()
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const json = JSON.parse(trimmed)
        const items = Array.isArray(json) ? json : json.contents || []
        imported = items.map((item: any) => ({
          id: item.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          type: item.type || "movie",
          title: item.title || "Tanpa Judul",
          overview: item.overview || "",
          posterPath: item.posterPath || item.poster_path || "",
          backdropPath: item.backdropPath || item.backdrop_path || "",
          releaseYear: item.releaseYear ? Number(item.releaseYear) : item.release_date ? new Date(item.release_date).getFullYear() : null,
          rating: item.rating ? Number(item.rating) : item.vote_average ? Number(item.vote_average) : null,
          durationMinutes: item.durationMinutes ? Number(item.durationMinutes) : item.runtime ? Number(item.runtime) : null,
          genres: item.genres ? (Array.isArray(item.genres) ? item.genres : (item.genres as string).split(",").map((g: string) => g.trim()).filter(Boolean)) : [],
          seasons: item.seasons ? Number(item.seasons) : item.number_of_seasons ? Number(item.number_of_seasons) : null,
        }))
      } catch {
        return NextResponse.json({ message: "Format JSON tidak valid" }, { status: 400 })
      }
    } else {
      const lines = trimmed.split("\n").filter((line) => line.trim())
      if (lines.length < 2) {
        return NextResponse.json({ message: "File CSV kosong atau format salah" }, { status: 400 })
      }
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
      const titleIdx = headers.findIndex((h) => h === "title" || h === "judul")
      const typeIdx = headers.findIndex((h) => h === "type" || h === "tipe" || h === "jenis")
      const overviewIdx = headers.findIndex((h) => h === "overview" || h === "deskripsi" || h === "sinopsis")
      const posterIdx = headers.findIndex((h) => h === "posterpath" || h === "poster" || h === "poster_url")
      const backdropIdx = headers.findIndex((h) => h === "backdroppath" || h === "backdrop" || h === "backdrop_url")
      const yearIdx = headers.findIndex((h) => h === "releaseyear" || h === "year" || h === "tahun")
      const ratingIdx = headers.findIndex((h) => h === "rating" || h === "vote_average")
      const durationIdx = headers.findIndex((h) => h === "durationminutes" || h === "duration" || h === "durasi")
      const genresIdx = headers.findIndex((h) => h === "genres" || h === "genre")
      const seasonsIdx = headers.findIndex((h) => h === "seasons" || h === "musim")

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim())
        const get = (idx: number) => (idx >= 0 ? cols[idx] : "")
        const importedGenres = get(genresIdx) ? parseGenreInput(get(genresIdx)) : []
        imported.push({
          id: `local-${Date.now()}-${i}`,
          type: (get(typeIdx) || "movie").toLowerCase() === "tv" || (get(typeIdx) || "movie").toLowerCase() === "series" ? "tv" : "movie",
          title: get(titleIdx) || `Import ${i}`,
          overview: get(overviewIdx),
          posterPath: get(posterIdx),
          backdropPath: get(backdropIdx),
          releaseYear: get(yearIdx) ? Number(get(yearIdx)) : null,
          rating: get(ratingIdx) ? Number(get(ratingIdx)) : null,
          durationMinutes: get(durationIdx) ? Number(get(durationIdx)) : null,
          genres: importedGenres,
          seasons: get(seasonsIdx) ? Number(get(seasonsIdx)) : null,
        })
      }
    }

    const existing = loadLocalContent()
    const existingIds = new Set(existing.map((c) => c.id))
    const newItems = imported.filter((item) => !existingIds.has(item.id))
    const merged = [...existing, ...newItems]
    saveLocalContent(merged)

    return NextResponse.json({ data: newItems, count: newItems.length, total: merged.length })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({ message: "Gagal mengimpor data" }, { status: 500 })
  }
}