"use client"

import { useState, useEffect, FormEvent } from "react"
import { Header } from "@/components/Header"
import Link from "next/link"

type TmdbItem = {
  tmdbId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath?: string
  backdropPath?: string
  overview?: string
  releaseDate?: string
  voteAverage?: number
}

export default function BatchImportPage() {
  const [query, setQuery] = useState("")
  const [type, setType] = useState<"movie" | "tv">("movie")
  const [genreId, setGenreId] = useState("")
  const [year, setYear] = useState("")
  const [country, setCountry] = useState("")
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([])
  const [results, setResults] = useState<TmdbItem[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetch(`${"/api/genres"}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.genres) {
          setGenres(data.genres)
        }
      })
      .catch(() => {})
  }, [])

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setSelected(new Set())
    setPage(1)

    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set("q", query.trim())
      params.set("type", type)
      if (genreId) params.set("genreId", genreId)
      if (year) params.set("year", year)
      if (country) params.set("country", country)
      params.set("page", "1")

      const res = await fetch(`/api/admin/tmdb/search?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Gagal mencari konten")
      }

      setResults(data.results || [])
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (selected.size === 0) {
      setMessage("Pilih minimal satu konten untuk diimport")
      return
    }

    setImporting(true)
    setMessage(null)

    try {
      const items = results
        .filter((item) => selected.has(item.tmdbId))
        .map((item) => ({
          tmdbId: item.tmdbId,
          mediaType: item.mediaType,
          title: item.title,
          posterPath: item.posterPath,
          backdropPath: item.backdropPath,
          overview: item.overview,
          releaseYear: item.releaseDate ? parseInt(item.releaseDate.slice(0, 4), 10) : undefined,
          rating: item.voteAverage,
        }))

      const res = await fetch("/api/admin/tmdb/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Gagal import")
      }

      setMessage(data.message)
      setSelected(new Set())
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setImporting(false)
    }
  }

  const toggleSelect = (tmdbId: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(tmdbId)) {
        next.delete(tmdbId)
      } else {
        next.add(tmdbId)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === results.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(results.map((r) => r.tmdbId)))
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Batch Import TMDB</h1>
            <p className="text-zinc-400 mt-1">Cari dan import banyak konten dari TMDB sekaligus.</p>
          </div>
          <Link href="/admin" className="rounded border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-400 transition-colors">
            ← Kembali ke Admin
          </Link>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-200">{message}</p>
          </div>
        )}

        <form onSubmit={handleSearch} className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 mb-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="query">Search</label>
              <input
                id="query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
                placeholder="Cari film/series..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="type">Tipe</label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as "movie" | "tv")}
                className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white"
              >
                <option value="movie">Movie</option>
                <option value="tv">TV Series</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="genre">Genre</label>
              <select
                id="genre"
                value={genreId}
                onChange={(e) => setGenreId(e.target.value)}
                className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white"
              >
                <option value="">Semua Genre</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="year">Tahun</label>
              <input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
                placeholder="2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="country">Negara</label>
              <input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
                placeholder="US, KR, ID"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="rounded bg-red-600 px-6 py-2 text-sm font-bold hover:bg-red-500 disabled:opacity-60 transition-colors">
              {loading ? "Mencari..." : "Cari"}
            </button>
            <button type="button" onClick={handleImport} disabled={importing || selected.size === 0} className="rounded bg-green-600 px-6 py-2 text-sm font-bold hover:bg-green-500 disabled:opacity-60 transition-colors">
              {importing ? "Mengimport..." : `Import ${selected.size > 0 ? `(${selected.size})` : ""}`}
            </button>
          </div>
        </form>

        {results.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.size === results.length}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-zinc-400">Pilih Semua</span>
            </div>
            <span className="text-sm text-zinc-400">{results.length} hasil</span>
          </div>
        )}

        {results.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            Belum ada hasil. Coba cari konten di atas.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((item) => (
              <div
                key={`${item.mediaType}-${item.tmdbId}`}
                className={`rounded-lg border overflow-hidden transition-colors ${
                  selected.has(item.tmdbId) ? "border-red-500 bg-zinc-900" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                }`}
              >
                <div className="relative aspect-[2/3] bg-zinc-800">
                  {item.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500 text-4xl">🎬</div>
                  )}
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selected.has(item.tmdbId)}
                      onChange={() => toggleSelect(item.tmdbId)}
                      className="h-5 w-5 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-500"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${item.mediaType === "movie" ? "bg-blue-900/80 text-blue-200" : "bg-green-900/80 text-green-200"}`}>
                      {item.mediaType === "movie" ? "Movie" : "TV"}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-white text-sm truncate">{item.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {item.releaseDate?.slice(0, 4)}
                    {item.voteAverage ? ` • ⭐ ${item.voteAverage.toFixed(1)}` : ""}
                  </p>
                  {item.overview && (
                    <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{item.overview}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
