"use client"

import { useState, useEffect, FormEvent, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/Header"

type SearchResult = {
  id: string
  title: string
  posterPath?: string | null
  backdropPath?: string | null
  releaseYear?: number | null
  type: "movie" | "tv" | "custom"
  source: "tmdb" | "custom"
  overview?: string | null
}

function SearchResultsInner() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!query) {
      setResults([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        setResults(json.data || [])
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [query])

  const href = (item: SearchResult) => {
    if (item.source === "custom") {
      return item.type === "tv" ? `/series/${item.id}` : `/movie/${item.id}`
    }
    return item.type === "tv" ? `/series/${item.id}` : `/movie/${item.id}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-2">Hasil Pencarian</h1>
      <p className="text-zinc-400 mb-8">
        {loading ? "Mencari..." : `${results.length} hasil untuk "${query}"`}
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">Tidak ada hasil</h2>
          <p className="text-zinc-400">Coba kata kunci lain atau tambah konten manual di Admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((item) => (
            <Link
              key={`${item.source}-${item.id}`}
              href={href(item)}
              className="group"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-800 mb-2">
                {item.posterPath ? (
                  <Image
                    src={item.posterPath}
                    alt={item.title}
                    fill
                    className="object-cover transition-opacity duration-200 group-hover:opacity-80"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-500 text-xs">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300 capitalize">
                    {item.source === "tmdb" ? "TMDB" : "Custom"}
                  </span>
                </div>
              </div>
              <h3 className="text-sm font-medium text-zinc-100 truncate group-hover:text-white transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-zinc-400 truncate">
                {item.releaseYear || "TBA"} • {item.type === "tv" ? "Series" : "Movie"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function SearchResultsSuspense() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" /></div>}>
      <SearchResultsInner />
    </Suspense>
  )
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />
      <SearchResultsSuspense />
    </div>
  )
}
