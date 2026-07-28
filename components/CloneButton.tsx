"use client"

import { useState } from "react"

type CloneButtonProps = {
  id: string
  title: string
  source?: "custom" | "local"
}

export default function CloneButton({ id, title, source = "custom" }: CloneButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClone = async () => {
    setLoading(true)
    setError(null)

    try {
      const endpoint = source === "local" ? `/api/admin/local-content/clone` : `/api/admin/content/${encodeURIComponent(id)}/clone`
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: source === "local" ? JSON.stringify({ id }) : undefined,
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.message || "Gagal menggandakan konten")
      }

      window.location.reload()
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClone}
        disabled={loading}
        className="rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700 transition-colors disabled:opacity-60"
      >
        {loading ? "Menggandakan..." : "Gandakan"}
      </button>
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </div>
  )
}