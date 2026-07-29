import { NextResponse } from "next/server"
import { searchTmdb, fetchMoviesByGenre, fetchSeriesByGenre, fetchMoviesByYear, fetchSeriesByYear, fetchMoviesByCountry, fetchSeriesByCountry, TmdbGenre } from "@/lib/tmdb"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const check = searchParams.get("check")

    if (check === "true") {
      const hasApiKey = !!process.env.TMDB_API_KEY && process.env.TMDB_API_KEY.trim().length > 0
      return NextResponse.json({ enabled: hasApiKey })
    }

    const query = searchParams.get("q") || ""
    const type = searchParams.get("type") || "movie"
    const genreId = searchParams.get("genreId") || ""
    const year = searchParams.get("year") || ""
    const country = searchParams.get("country") || ""
    const page = parseInt(searchParams.get("page") || "1", 10)

    if (!process.env.TMDB_API_KEY || process.env.TMDB_API_KEY.trim().length === 0) {
      return NextResponse.json({ message: "TMDB_API_KEY belum dikonfigurasi. Tambahkan TMDB_API_KEY ke file .env untuk menggunakan fitur ini." }, { status: 500 })
    }

    let results: any[] = []

    if (query.trim()) {
      const searchResults = await searchTmdb(query.trim())
      results = searchResults.filter((item) => !type || item.media_type === type)
    } else if (genreId) {
      if (type === "tv") {
        results = await fetchSeriesByGenre(parseInt(genreId, 10), page)
      } else {
        results = await fetchMoviesByGenre(parseInt(genreId, 10), page)
      }
    } else if (year) {
      if (type === "tv") {
        results = await fetchSeriesByYear(parseInt(year, 10), page)
      } else {
        results = await fetchMoviesByYear(parseInt(year, 10), page)
      }
    } else if (country) {
      if (type === "tv") {
        results = await fetchSeriesByCountry(country, page)
      } else {
        results = await fetchMoviesByCountry(country, page)
      }
    } else {
      if (type === "tv") {
        const res = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${encodeURIComponent(process.env.TMDB_API_KEY)}&language=id-ID&page=${page}&sort_by=popularity.desc`)
        const data = await res.json()
        results = data?.results || []
      } else {
        const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${encodeURIComponent(process.env.TMDB_API_KEY)}&language=id-ID&page=${page}&sort_by=popularity.desc`)
        const data = await res.json()
        results = data?.results || []
      }
    }

    return NextResponse.json({ results, page })
  } catch (error) {
    console.error("Error searching TMDB:", error)
    return NextResponse.json({ message: "Gagal mencari konten" }, { status: 500 })
  }
}
