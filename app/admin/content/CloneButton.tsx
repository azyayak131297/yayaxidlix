"use client"

import { useState } from "react"

type CloneButtonProps = {
  id: string
  title: string
}

export default function CloneButton({ id, title }: CloneButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClone = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/content/${encodeURIComponent(id)}/clone`, {
        method: "POST",
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