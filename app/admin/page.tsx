"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"

type ContentFormData = {
  title: string
  overview: string
  posterPath: string
  backdropPath: string
  releaseYear: string
  rating: string
  durationMinutes: string
  genres: string
  type: "movie" | "tv"
  seasons: string
}

type VideoFormData = {
  url: string
  type: "archive" | "youtube" | "vimeo" | "direct"
  label: string
  quality: string
}

type UnifiedFormData = ContentFormData & {
  video: VideoFormData
}

const emptyContent: ContentFormData = {
  title: "",
  overview: "",
  posterPath: "",
  backdropPath: "",
  releaseYear: "",
  rating: "",
  durationMinutes: "",
  genres: "",
  type: "movie",
  seasons: "",
}

const emptyVideo: VideoFormData = {
  url: "",
  type: "youtube",
  label: "",
  quality: "",
}

type SubmitState = "idle" | "submitting" | "success" | "error"
type Result = { contentId?: string; videoKey?: string; error?: string }
type ActiveTab = "unified" | "legacy" | "networks"

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<ActiveTab>("unified")
  const [form, setForm] = useState<UnifiedFormData>({
    ...emptyContent,
    video: { ...emptyVideo },
  })
  const [submitState, setSubmitState] = useState<SubmitState>("idle")
  const [result, setResult] = useState<Result>({})
  const [message, setMessage] = useState<string | null>(null)
  const [networkForm, setNetworkForm] = useState({
    networkId: "",
    networkName: "",
    backdropUrl: "",
    color: "#1a1a2e",
  })
  const [networkState, setNetworkState] = useState<SubmitState>("idle")
  const [networkMessage, setNetworkMessage] = useState<string | null>(null)

  const handleContentChange = (field: keyof ContentFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleVideoChange = (field: keyof VideoFormData, value: string) => {
    setForm((prev) => ({ ...prev, video: { ...prev.video, [field]: value } }))
  }

  const generateContentId = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    let id = "custom-"
    for (let i = 0; i < 12; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return id
  }

  const handleUnifiedSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitState("submitting")
    setMessage(null)
    setResult({})

    try {
      const contentId = generateContentId()

      const contentBody = {
        title: form.title,
        overview: form.overview || null,
        posterPath: form.posterPath || null,
        backdropPath: form.backdropPath || null,
        releaseYear: form.releaseYear ? Number(form.releaseYear) : null,
        rating: form.rating ? Number(form.rating) : null,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
        genres: form.genres || null,
        type: form.type,
        seasons: form.type === "tv" && form.seasons ? Number(form.seasons) : null,
      }

      const contentRes = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentBody),
      })

      if (!contentRes.ok) {
        const text = await contentRes.text()
        throw new Error(`Gagal menyimpan konten: ${text}`)
      }

      const contentJson = await contentRes.json()
      const usedContentId = contentJson.id || contentId

      const videoKey = `custom-${usedContentId}`

      const videoRes = await fetch("/api/admin/video-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          key: videoKey,
          contentType: "custom",
          source: {
            type: form.video.type,
            url: form.video.url.trim(),
            label: form.video.label.trim() || undefined,
            quality: form.video.quality.trim() || undefined,
          },
        }),
      })

      if (!videoRes.ok) {
        const text = await videoRes.text()
        throw new Error(`Konten tersimpan tapi gagal menyimpan video source: ${text}`)
      }

      setSubmitState("success")
      setResult({ contentId: usedContentId, videoKey })
      setMessage(`✅ Konten dan video source berhasil disimpan!`)

      setForm({
        ...emptyContent,
        video: { ...emptyVideo },
      })
    } catch (err) {
      setSubmitState("error")
      setMessage(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui")
    } finally {
      setSubmitState("idle")
    }
  }

  const sourceTypeOptions = [
    { value: "archive", label: "📦 Archive.org" },
    { value: "youtube", label: "▶ YouTube" },
    { value: "vimeo", label: "🎬 Vimeo" },
    { value: "direct", label: "🔗 Direct URL" },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-4 mb-8 border-b border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("unified")}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "unified"
                ? "text-red-400 border-b-2 border-red-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            🚀 Tambah Cepat (Konten + Video)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("legacy")}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "legacy"
                ? "text-red-400 border-b-2 border-red-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            ⚙️ Form Lengkap (Split)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("networks")}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === "networks"
                ? "text-red-400 border-b-2 border-red-400"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            📺 Jaringan Backdrops
          </button>
        </div>

        {activeTab === "unified" ? (
          <section>
            <h1 className="text-2xl font-bold mb-2">Tambah Konten & Video Sekaligus</h1>
            <p className="text-zinc-400 text-sm mb-6">
              Isi semua data di bawah ini. Konten dan video source akan disimpan dalam satu klik.
              Setelah submit, konten langsung aktif dan bisa ditonton.
            </p>

            <form onSubmit={handleUnifiedSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipe Konten</label>
                  <select
                    value={form.type}
                    onChange={(e) => handleContentChange("type", e.target.value)}
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                  >
                    <option value="movie">🎬 Movie</option>
                    <option value="tv">📺 TV Series</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Judul *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => handleContentChange("title", e.target.value)}
                    placeholder="Contoh: Avengers: Endgame"
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sinopsis</label>
                <textarea
                  value={form.overview}
                  onChange={(e) => handleContentChange("overview", e.target.value)}
                  rows={3}
                  placeholder="Deskripsi singkat konten..."
                  className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">URL Poster</label>
                  <input
                    value={form.posterPath}
                    onChange={(e) => handleContentChange("posterPath", e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL Backdrop</label>
                  <input
                    value={form.backdropPath}
                    onChange={(e) => handleContentChange("backdropPath", e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tahun Rilis</label>
                  <input
                    value={form.releaseYear}
                    onChange={(e) => handleContentChange("releaseYear", e.target.value)}
                    placeholder="2025"
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rating</label>
                  <input
                    value={form.rating}
                    onChange={(e) => handleContentChange("rating", e.target.value)}
                    placeholder="7.5"
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Durasi (menit)</label>
                  <input
                    value={form.durationMinutes}
                    onChange={(e) => handleContentChange("durationMinutes", e.target.value)}
                    placeholder="90"
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Genre (pisah dengan koma)</label>
                <input
                  value={form.genres}
                  onChange={(e) => handleContentChange("genres", e.target.value)}
                  placeholder="Action, Drama, Sci-Fi"
                  className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                />
              </div>

              {form.type === "tv" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Jumlah Musim</label>
                  <input
                    value={form.seasons}
                    onChange={(e) => handleContentChange("seasons", e.target.value)}
                    placeholder="1"
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                  />
                </div>
              )}

              <hr className="border-zinc-800 my-4" />
              <h2 className="text-xl font-bold mb-4">🎬 Sumber Video</h2>
              <p className="text-zinc-400 text-sm mb-4">
                Video source akan otomatis terhubung ke konten yang baru dibuat. ID konten akan
                tampil setelah submit pertama.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipe Sumber Video</label>
                  <select
                    value={form.video.type}
                    onChange={(e) => handleVideoChange("type", e.target.value)}
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                  >
                    {sourceTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL Video *</label>
                  <input
                    required
                    value={form.video.url}
                    onChange={(e) => handleVideoChange("url", e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Label (opsional)</label>
                  <input
                    value={form.video.label}
                    onChange={(e) => handleVideoChange("label", e.target.value)}
                    placeholder="YouTube, Archive, dll"
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kualitas (opsional)</label>
                  <input
                    value={form.video.quality}
                    onChange={(e) => handleVideoChange("quality", e.target.value)}
                    placeholder="720p, 1080p"
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitState === "submitting"}
                className="w-full rounded bg-red-600 px-4 py-3 text-sm font-bold hover:bg-red-500 disabled:opacity-60 transition-colors"
              >
                {submitState === "submitting"
                  ? "⏳ Menyimpan konten & video source..."
                  : "🚀 Submit Konten & Video Sekaligus"}
              </button>
            </form>

            {message && (
              <div
                className={`mt-6 p-4 rounded-lg border ${
                  submitState === "success"
                    ? "bg-green-900/30 border-green-700 text-green-300"
                    : submitState === "error"
                      ? "bg-red-900/30 border-red-700 text-red-300"
                      : "bg-zinc-900 border-zinc-700 text-zinc-300"
                }`}
              >
                <p className="whitespace-pre-wrap">{message}</p>

                {submitState === "success" && result.contentId && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold text-green-400">✅ Berhasil disimpan!</p>
                    <p className="text-xs text-zinc-400">
                      Konten ID: <code className="text-zinc-300">{result.contentId}</code>
                    </p>
                    <p className="text-xs text-zinc-400">
                      Video Key: <code className="text-zinc-300">{result.videoKey}</code>
                    </p>
                    <a
                      href={`/watch/${form.type}/${result.contentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      👉 Lihat konten di halaman Tonton →
                    </a>
                  </div>
                )}
              </div>
            )}
          </section>
        ) : (
          <section>
            <h1 className="text-2xl font-bold mb-2">Form Lengkap (Split Tab)</h1>
            <p className="text-zinc-400 text-sm mb-6">
              Gunakan tab ini jika ingin mengelola konten dan video source secara terpisah.
            </p>

            <div className="flex gap-4 mb-8 border-b border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab("unified")}
                className="pb-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors border-b-2 border-transparent"
              >
                🚀 Tambah Cepat
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("legacy")}
                className="pb-3 text-sm font-medium text-red-400 border-b-2 border-red-400"
              >
                ⚙️ Form Lengkap
              </button>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4">📝 Konten Manual</h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setSubmitState("submitting")
                    setMessage(null)
                    try {
                      const res = await fetch("/api/admin/content", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          title: form.title,
                          overview: form.overview || null,
                          posterPath: form.posterPath || null,
                          backdropPath: form.backdropPath || null,
                          releaseYear: form.releaseYear ? Number(form.releaseYear) : null,
                          rating: form.rating ? Number(form.rating) : null,
                          durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
                          genres: form.genres || null,
                          type: form.type,
                          seasons: form.type === "tv" && form.seasons ? Number(form.seasons) : null,
                        }),
                      })
                      if (!res.ok) {
                        const text = await res.text()
                        throw new Error(text || "Gagal menyimpan konten")
                      }
                      const data = await res.json()
                      setResult({ contentId: data.id })
                      setMessage(`✅ Konten berhasil disimpan dengan ID: ${data.id}`)
                      setForm({ ...emptyContent, video: form.video })
                    } catch (err) {
                      setMessage(err instanceof Error ? err.message : "Terjadi kesalahan")
                    } finally {
                      setSubmitState("idle")
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipe</label>
                    <select
                      value={form.type}
                      onChange={(e) => handleContentChange("type", e.target.value)}
                      className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                    >
                      <option value="movie">Movie</option>
                      <option value="tv">TV Series</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Judul *</label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => handleContentChange("title", e.target.value)}
                      className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sinopsis</label>
                    <textarea
                      value={form.overview}
                      onChange={(e) => handleContentChange("overview", e.target.value)}
                      rows={3}
                      className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">URL Poster</label>
                      <input
                        value={form.posterPath}
                        onChange={(e) => handleContentChange("posterPath", e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">URL Backdrop</label>
                      <input
                        value={form.backdropPath}
                        onChange={(e) => handleContentChange("backdropPath", e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tahun Rilis</label>
                      <input
                        value={form.releaseYear}
                        onChange={(e) => handleContentChange("releaseYear", e.target.value)}
                        placeholder="2025"
                        className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Rating</label>
                      <input
                        value={form.rating}
                        onChange={(e) => handleContentChange("rating", e.target.value)}
                        placeholder="7.5"
                        className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Durasi (menit)</label>
                      <input
                        value={form.durationMinutes}
                        onChange={(e) => handleContentChange("durationMinutes", e.target.value)}
                        placeholder="90"
                        className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Genre (pisah koma)</label>
                    <input
                      value={form.genres}
                      onChange={(e) => handleContentChange("genres", e.target.value)}
                      placeholder="Action, Drama"
                      className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                    />
                  </div>
                  {form.type === "tv" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Jumlah Musim</label>
                      <input
                        value={form.seasons}
                        onChange={(e) => handleContentChange("seasons", e.target.value)}
                        placeholder="1"
                        className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submitState === "submitting"}
                    className="rounded bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-500 disabled:opacity-60"
                  >
                    {submitState === "submitting" ? "Menyimpan..." : "Simpan Konten"}
                  </button>
                </form>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-4">🎬 Sumber Video</h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setSubmitState("submitting")
                    setMessage(null)
                    try {
                      const key = `custom-${result.contentId || form.title.toLowerCase().replace(/\s+/g, "-")}`
                      const res = await fetch("/api/admin/video-sources", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "upsert",
                          key,
                          contentType: "custom",
                          source: {
                            type: form.video.type,
                            url: form.video.url.trim(),
                            label: form.video.label.trim() || undefined,
                            quality: form.video.quality.trim() || undefined,
                          },
                        }),
                      })
                      if (!res.ok) {
                        const text = await res.text()
                        throw new Error(text || "Gagal menyimpan video source")
                      }
                      setResult((prev) => ({ ...prev, videoKey: key }))
                      setMessage(`✅ Video source berhasil disimpan dengan key: ${key}`)
                      setForm({ ...emptyContent, video: emptyVideo })
                    } catch (err) {
                      setMessage(err instanceof Error ? err.message : "Terjadi kesalahan")
                    } finally {
                      setSubmitState("idle")
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipe Sumber</label>
                      <select
                        value={form.video.type}
                        onChange={(e) => handleVideoChange("type", e.target.value)}
                        className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                      >
                        {sourceTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">URL Video *</label>
                      <input
                        required
                        value={form.video.url}
                        onChange={(e) => handleVideoChange("url", e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Label (opsional)</label>
                      <input
                        value={form.video.label}
                        onChange={(e) => handleVideoChange("label", e.target.value)}
                        placeholder="YouTube"
                        className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Kualitas (opsional)</label>
                      <input
                        value={form.video.quality}
                        onChange={(e) => handleVideoChange("quality", e.target.value)}
                        placeholder="720p"
                        className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitState === "submitting"}
                    className="rounded bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-500 disabled:opacity-60"
                  >
                    {submitState === "submitting" ? "Menyimpan..." : "Simpan Video Source"}
                  </button>
                </form>
              </section>
            </div>
          </section>
        )}
        {activeTab === "networks" && (
          <section>
            <h1 className="text-2xl font-bold mb-2">📺 Jaringan Backdrops</h1>
            <p className="text-zinc-400 text-sm mb-6">
              Atur backdrop dan warna untuk setiap jaringan yang ditampilkan di halaman Jaringan.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setNetworkState("submitting")
                setNetworkMessage(null)
                try {
                  const networkId = networkForm.networkId
                  const res = await fetch("/api/admin/network-backdrops", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "upsert",
                      networkId,
                      backdrop: {
                        network: networkForm.networkName,
                        backdropUrl: networkForm.backdropUrl,
                        color: networkForm.color,
                      },
                    }),
                  })
                  if (!res.ok) {
                    const text = await res.text()
                    throw new Error(text || "Gagal menyimpan network backdrop")
                  }
                  setNetworkMessage("✅ Network backdrop berhasil disimpan!")
                  setNetworkForm({ networkId: "", networkName: "", backdropUrl: "", color: "#1a1a2e" })
                } catch (err) {
                  setNetworkMessage(err instanceof Error ? err.message : "Terjadi kesalahan")
                } finally {
                  setNetworkState("idle")
                }
              }}
              className="space-y-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">ID Jaringan (TMDB ID) *</label>
                  <input
                    required
                    value={networkForm.networkId}
                    onChange={(e) => setNetworkForm((p) => ({ ...p, networkId: e.target.value }))}
                    placeholder="Contoh: 273"
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Jaringan *</label>
                  <input
                    required
                    value={networkForm.networkName}
                    onChange={(e) => setNetworkForm((p) => ({ ...p, networkName: e.target.value }))}
                    placeholder="Contoh: Amazon Prime"
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL Backdrop *</label>
                <input
                  required
                  value={networkForm.backdropUrl}
                  onChange={(e) => setNetworkForm((p) => ({ ...p, backdropUrl: e.target.value }))}
                  placeholder="https://image.tmdb.org/t/p/original/..."
                  className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Warna Brand (fallback)</label>
                <input
                  value={networkForm.color}
                  onChange={(e) => setNetworkForm((p) => ({ ...p, color: e.target.value }))}
                  placeholder="#1a1a2e"
                  className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={networkState === "submitting"}
                className="w-full rounded bg-red-600 px-4 py-3 text-sm font-bold hover:bg-red-500 disabled:opacity-60 transition-colors"
              >
                {networkState === "submitting" ? "Menyimpan..." : "💾 Simpan Network Backdrop"}
              </button>
              {networkMessage && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    networkMessage.startsWith("✅")
                      ? "bg-green-900/30 border border-green-700 text-green-300"
                      : "bg-red-900/30 border border-red-700 text-red-300"
                  }`}
                >
                  {networkMessage}
                </div>
              )}
            </form>
          </section>
        )}
      </main>
    </div>
  )
}