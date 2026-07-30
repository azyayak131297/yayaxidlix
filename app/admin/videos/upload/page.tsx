"use client"

import { useState, useCallback, FormEvent } from "react"
import { Header } from "@/components/Header"
import Link from "next/link"

export default function AdminUploadPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [remoteUrl, setRemoteUrl] = useState("")
  const [uploadMode, setUploadMode] = useState<"file" | "remote">("file")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setEmbedUrl(null)

    if (!title.trim()) {
      setError("Judul wajib diisi.")
      return
    }

    if (uploadMode === "file" && !file) {
      setError("Pilih file video terlebih dahulu.")
      return
    }

    if (uploadMode === "remote" && !remoteUrl.trim()) {
      setError("Masukkan URL video terlebih dahulu.")
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("provider", "doodstream")
      formData.append("title", title.trim())
      formData.append("description", description.trim())
      formData.append("uploadMode", uploadMode)

      if (uploadMode === "remote") {
        formData.append("remoteUrl", remoteUrl.trim())
      } else if (file) {
        formData.append("file", file)
      }

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Upload gagal")
      }

      setSuccess(uploadMode === "remote" ? "Remote upload berhasil dimulai!" : "Video berhasil diupload!")
      setEmbedUrl(data.embedUrl)
      setTitle("")
      setDescription("")
      setFile(null)
      setRemoteUrl("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Upload Video</h1>
            <p className="text-zinc-400 mt-1">Upload video ke DoodStream untuk ditonton.</p>
          </div>
          <Link href="/admin/videos" className="rounded border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-400 transition-colors">
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
            {embedUrl && (
              <p className="mt-2 text-xs text-green-400 break-all">
                Embed URL: <a href={embedUrl} target="_blank" rel="noopener noreferrer" className="underline">{embedUrl}</a>
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Mode Upload</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`rounded px-4 py-2 text-sm font-medium transition-colors ${uploadMode === "file" ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("remote")}
                className={`rounded px-4 py-2 text-sm font-medium transition-colors ${uploadMode === "remote" ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
              >
                Remote URL
              </button>
            </div>
          </div>

          {uploadMode === "file" ? (
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="file">Video File *</label>
              <input
                id="file"
                type="file"
                accept="video/*"
                required
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white file:text-zinc-300 file:bg-zinc-800 file:border-0 file:px-3 file:py-1"
              />
              <p className="text-xs text-zinc-500 mt-1">Format: MP4, AVI, MOV, MKV. Max 5GB (free tier).</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="remoteUrl">URL Video *</label>
              <input
                id="remoteUrl"
                type="url"
                required
                value={remoteUrl}
                onChange={(e) => setRemoteUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
              />
              <p className="text-xs text-zinc-500 mt-1">Paste link langsung ke file video. DoodStream akan mengunduh dan memprosesnya.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="title">Judul *</label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Film Pendek Karakter"
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="description">Deskripsi</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Deskripsi singkat video..."
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-red-600 px-4 py-3 text-sm font-bold hover:bg-red-500 disabled:opacity-60 transition-colors"
          >
            {submitting ? "Mengupload..." : uploadMode === "remote" ? "Upload dari URL" : "Upload File"}
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="text-sm font-semibold mb-2">Cara Upload Manual ke DoodStream</h2>
          <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-400">
            <li>Buka <a href="https://doodstream.com/login" target="_blank" rel="noopener noreferrer" className="text-red-400 underline">https://doodstream.com/login</a></li>
            <li>Login dengan akun DoodStream kamu</li>
            <li>Klik <strong>Upload</strong> atau buka <a href="https://doodstream.com/upload" target="_blank" rel="noopener noreferrer" className="text-red-400 underline">https://doodstream.com/upload</a></li>
            <li>Pilih video dari komputer, atau paste URL video</li>
            <li>Tunggu proses upload selesai</li>
            <li>Copy <strong>Embed URL</strong> yang muncul</li>
            <li>Paste URL tersebut ke form di atas, atau gunakan tombol <strong>Remote URL</strong></li>
          </ol>
          <p className="text-xs text-zinc-500 mt-2">
            Setelah upload, video otomatis tersimpan dan bisa ditonton di aplikasi ini.
          </p>
        </div>
      </main>
    </div>
  )
}
