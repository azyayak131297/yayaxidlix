"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

type VideoFormData = {
  key: string
  type: "archive" | "youtube" | "vimeo" | "direct"
  url: string
  label: string
  quality: string
  contentType: "movie" | "tv" | "tv-episode" | "custom"
}

const emptyForm: VideoFormData = {
  key: "",
  type: "youtube",
  url: "",
  label: "",
  quality: "1080p",
  contentType: "custom",
}

export default function VideoForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEdit = !!searchParams.get("key")
  const initialKey = searchParams.get("key") || ""
  const initialContentType = searchParams.get("contentType") || "custom"

  const [form, setForm] = useState<VideoFormData>({ ...emptyForm, key: initialKey, contentType: initialContentType as any })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/video-sources`)
        const json = await res.json()
        const data = json.data
        const source = data.custom[initialKey] || data.movies[initialKey] || data.series?.episodes?.[initialKey]
        if (source) {
          setForm({
            key: initialKey,
            type: source.type,
            url: source.url,
            label: source.label || "",
            quality: source.quality || "1080p",
            contentType: data.custom[initialKey] ? "custom" : data.movies[initialKey] ? "movie" : "tv-episode",
          })
        }
      } catch {
        setError("Gagal memuat data video source")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isEdit, initialKey])

  const update = (field: keyof VideoFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const payload = {
      action: isEdit ? "upsert" : "upsert",
      key: form.key,
      contentType: form.contentType,
      source: {
        type: form.type,
        url: form.url,
        label: form.label,
        quality: form.quality,
      },
    }

    try {
      const res = await fetch(`/api/admin/video-sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan")
      setSuccess("Video source berhasil disimpan.")
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) return <div className="text-zinc-400">Memuat data video source...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded border border-red-800 bg-red-950/40 p-3 text-sm text-red-200">{error}</div>}
      {success && <div className="rounded border border-green-800 bg-green-950/40 p-3 text-sm text-green-200">{success}</div>}

      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-1">Kunci Konten (ID atau custom ID)</label>
        <input className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={form.key} onChange={(e) => update("key", e.target.value)} required />
        <p className="text-[11px] text-zinc-500 mt-1">Gunakan ID TMDB untuk movie/series, atau custom ID (misal: custom-...) untuk konten manual.</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-1">Jenis Konten</label>
        <select className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={form.contentType} onChange={(e) => update("contentType", e.target.value)}>
          <option value="custom">Custom</option>
          <option value="movie">Film TMDB</option>
          <option value="tv-episode">Episode Series</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Tipe Video</label>
          <select className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={form.type} onChange={(e) => update("type", e.target.value)}>
            <option value="youtube">YouTube</option>
            <option value="archive">Archive.org</option>
            <option value="vimeo">Vimeo</option>
            <option value="direct">Direct URL</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Kualitas</label>
          <input className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={form.quality} onChange={(e) => update("quality", e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-1">URL Video</label>
        <input className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={form.url} onChange={(e) => update("url", e.target.value)} required />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-1">Label</label>
        <input className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={form.label} onChange={(e) => update("label", e.target.value)} />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="rounded bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-500 transition-colors disabled:opacity-60">
          {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Video"}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-400 transition-colors">
          Batal
        </button>
      </div>
    </form>
  )
}