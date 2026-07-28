"use client"

import { useState } from "react"

type DeleteButtonProps = {
  id: string
}

export default function DeleteButton({ id }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    const confirmed = window.confirm("Yakin ingin menghapus konten ini? Aksi ini tidak bisa dibatalkan.")
    if (!confirmed) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/content/${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || "Gagal menghapus")
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
        onClick={handleDelete}
        disabled={loading}
        className="rounded bg-red-900/40 border border-red-800 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-900/70 transition-colors disabled:opacity-60"
      >
        {loading ? "Menghapus..." : "Hapus"}
      </button>
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </div>
  )
}