"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { getImageUrl, getYear } from "@/lib/tmdb"

export function ContentCard({
  id,
  title,
  name,
  posterPath,
  releaseDate,
  firstAirDate,
  mediaType,
}: {
  id: string | number
  title?: string
  name?: string
  posterPath?: string | null
  releaseDate?: string
  firstAirDate?: string
  mediaType: "movie" | "tv"
}) {
  const [imgError, setImgError] = useState(false)
  const [watchlisted, setWatchlisted] = useState(false)
  const [watchlistLoading, setWatchlistLoading] = useState(false)
  const displayTitle = title || name || "Untitled"
  const displayDate = releaseDate || firstAirDate || ""
  const year = getYear(displayDate)
  const href = mediaType === "movie" ? `/movie/${id}` : `/series/${id}`
  const imgSrc = posterPath ? getImageUrl(posterPath, "w300") : ""
  const showPlaceholder = !posterPath || imgError || !imgSrc
  const contentId = String(id)

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setWatchlistLoading(true)
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, contentType: mediaType }),
      })
      if (res.ok) {
        setWatchlisted(!watchlisted)
      }
    } catch {
      // handled silently
    } finally {
      setWatchlistLoading(false)
    }
  }

  return (
    <Link
      href={href}
      className="group relative flex-shrink-0 w-[160px] sm:w-[180px] transition-transform duration-200 hover:scale-105"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-800">
        {showPlaceholder ? (
          <div className="flex h-full w-full items-center justify-center text-zinc-500 text-sm">
            No Image
          </div>
        ) : (
          <Image
            src={imgSrc}
            alt={displayTitle}
            fill
            className="object-cover transition-opacity duration-200 group-hover:opacity-80"
            sizes="(max-width: 640px) 160px, 180px"
            onError={() => setImgError(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <button
          type="button"
          onClick={handleWatchlistToggle}
          disabled={watchlistLoading}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors z-10"
          title={watchlisted ? "Hapus dari Watchlist" : "Tambah ke Watchlist"}
        >
          <svg
            className="w-4 h-4"
            fill={watchlisted ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </button>
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-xs text-zinc-300 truncate">{year || "TBA"}</p>
        </div>
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-medium text-zinc-100 truncate group-hover:text-white transition-colors">
          {displayTitle}
        </h3>
      </div>
    </Link>
  )
}
