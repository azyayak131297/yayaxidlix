"use client"

import { useState, useEffect } from "react"

export function WatchlistToggle({
  contentId,
  contentType,
}: {
  contentId: string
  contentType: "movie" | "tv"
}) {
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let mounted = true
    const check = async () => {
      try {
        const res = await fetch("/api/watchlist")
        if (!res.ok) return
        const json = await res.json()
        const exists = (json.data || []).some(
          (item: any) => item.contentId === contentId && item.contentType === contentType
        )
        if (mounted) {
          setAdded(exists)
        }
      } finally {
        if (mounted) setChecking(false)
      }
    }
    check()
    return () => {
      mounted = false
    }
  }, [contentId, contentType])

  const toggle = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, contentType }),
      })
      if (res.ok) {
        setAdded(!added)
      }
    } catch {
      // handled silently
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <button
        type="button"
        disabled
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-zinc-800 text-zinc-200 opacity-60"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        Memuat...
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        added
          ? "bg-yellow-500 text-black hover:bg-yellow-400"
          : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
      } disabled:opacity-50`}
    >
      <svg
        className="w-4 h-4"
        fill={added ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      {loading ? "Menyimpan..." : added ? "Di Watchlist" : "Tambah ke Watchlist"}
    </button>
  )
}