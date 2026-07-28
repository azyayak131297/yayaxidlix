"use client"

import { useState } from "react"

type QuickVideoFormProps = {
  contentId: string
  contentType?: "movie" | "tv" | "custom"
}

export default function QuickVideoForm({ contentId, contentType = "custom" }: QuickVideoFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState({
    type: "youtube" as "archive" | "youtube" | "vimeo" | "direct",
    url: "",
    label: "",
    quality: "1080p",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/admin/video-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          key: contentId,
          contentType,
          source: {
            type: form.type,
            url: form.url.trim(),
            label: form.label.trim() || undefined,
            quality: form.quality.trim() || undefined,
          },
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Gagal menyimpan video source")
      }

      setMessage("✅ Video source berhasil disimpan!")
      setForm({ type: "youtube", url: "", label: "", quality: "1080p" })
      setTimeout(() => {
        setOpen(false)
        setMessage(null)
      }, 1500)
    } catch (err: any) {
      setMessage(err.message || "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700 transition-colors"
      >
        + Video
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-3 rounded-lg border border-zinc-700 bg-zinc-950">
      <p className="text-xs text-zinc-400">ID: {contentId}</p>
      <select
        value={form.type}
        onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))}
        className="w-full rounded bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-xs text-white"
      >
        <option value="youtube">YouTube</option>
        <option value="archive">Archive.org</option>
        <option value="vimeo">Vimeo</option>
        <option value="direct">Direct URL</option>
      </select>
      <input
        required
        value={form.url}
        onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
        placeholder="URL Video"
        className="w-full rounded bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-xs text-white"
        autoFocus
      />
      <input
        value={form.label}
        onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
        placeholder="Label (opsional)"
        className="w-full rounded bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-xs text-white"
      />
      <input
        value={form.quality}
        onChange={(e) => setForm((f) => ({ ...f, quality: e.target.value }))}
        placeholder="Kualitas"
        className="w-full rounded bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-xs text-white"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="flex-1 rounded bg-red-600 px-2 py-1.5 text-xs font-bold hover:bg-red-500 disabled:opacity-60">
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
        <button type="button" onClick={() => { setOpen(false); setMessage(null) }} className="rounded border border-zinc-700 px-2 py-1.5 text-xs text-zinc-300">
          Batal
        </button>
      </div>
      {message && <p className="text-[11px] text-zinc-400">{message}</p>}
    </form>
  )
}