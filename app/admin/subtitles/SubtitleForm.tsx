"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import Link from "next/link"

type SubtitleFormProps = {
  initialData?: {
    id?: string
    contentId: string
    contentType: string
    episodeKey?: string
    language: string
    label: string
    format: string
    isDefault: boolean
    url?: string
  }
  mode: "create" | "edit"
}

export default function SubtitleForm({ initialData, mode }: SubtitleFormProps) {
  const router = useRouter()
  const [contentId, setContentId] = useState(initialData?.contentId || "")
  const [contentType, setContentType] = useState(initialData?.contentType || "movie")
  const [episodeKey, setEpisodeKey] = useState(initialData?.episodeKey || "")
  const [language, setLanguage] = useState(initialData?.language || "")
  const [label, setLabel] = useState(initialData?.label || "")
  const [format, setFormat] = useState(initialData?.format || "vtt")
  const [isDefault, setIsDefault] = useState(initialData?.isDefault || false)
  const [url, setUrl] = useState(initialData?.url || "")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (mode === "edit" && initialData?.language && !label) {
      setLabel(initialData.language)
    }
  }, [mode, initialData])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("contentId", contentId)
      formData.append("contentType", contentType)
      formData.append("language", language)
      formData.append("label", label)
      formData.append("format", format)
      formData.append("isDefault", String(isDefault))

      if (episodeKey) {
        formData.append("episodeKey", episodeKey)
      }

      if (mode === "edit" && url) {
        formData.append("url", url)
      }

      if (file) {
        formData.append("file", file)
      }

      const urlPath = mode === "edit" && initialData?.id ? `/api/admin/subtitles/${initialData.id}` : "/api/admin/subtitles"
      const method = mode === "edit" ? "PUT" : "POST"

      const res = await fetch(urlPath, {
        method,
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Gagal menyimpan subtitle")
      }

      setSuccess(mode === "edit" ? "Subtitle berhasil diperbarui!" : "Subtitle berhasil ditambahkan!")
      setTimeout(() => {
        router.push("/admin/subtitles")
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{mode === "edit" ? "Edit Subtitle" : "Tambah Subtitle"}</h1>
            <p className="text-zinc-400 mt-1">{mode === "edit" ? "Perbarui subtitle yang ada." : "Tambahkan subtitle baru untuk konten video."}</p>
          </div>
          <Link href="/admin/subtitles" className="rounded border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-400 transition-colors">
            ← Kembali
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 p-4">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-800 bg-green-950/40 p-4">
            <p className="text-sm text-green-200">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="contentId">Content ID *</label>
            <input
              id="contentId"
              type="text"
              required
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
              placeholder="contoh: local-31"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="contentType">Content Type *</label>
            <select
              id="contentType"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white"
            >
              <option value="movie">Movie</option>
              <option value="tv">TV</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="episodeKey">Episode Key (opsional)</label>
            <input
              id="episodeKey"
              type="text"
              value={episodeKey}
              onChange={(e) => setEpisodeKey(e.target.value)}
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
              placeholder="contoh: 123_s1e1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="language">Bahasa *</label>
            <input
              id="language"
              type="text"
              required
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
              placeholder="contoh: id atau en"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="label">Label *</label>
            <input
              id="label"
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
              placeholder="contoh: Indonesian"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="format">Format *</label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white"
            >
              <option value="vtt">VTT</option>
              <option value="srt">SRT</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isDefault"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="isDefault" className="text-sm text-zinc-300">Jadikan subtitle default</label>
          </div>

          {mode === "edit" && (
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="url">URL Subtitle</label>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
                placeholder="/subtitles/example.vtt"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="file">Upload File Subtitle</label>
            <input
              id="file"
              type="file"
              accept=".vtt,.srt"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white file:text-zinc-300 file:bg-zinc-800 file:border-0 file:px-3 file:py-1"
            />
            <p className="text-xs text-zinc-500 mt-1">Format yang didukung: .vtt, .srt</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-red-600 px-4 py-3 text-sm font-bold hover:bg-red-500 disabled:opacity-60 transition-colors"
          >
            {loading ? "Menyimpan..." : mode === "edit" ? "Simpan Perubahan" : "Tambah Subtitle"}
          </button>
        </form>
      </main>
    </div>
  )
}
