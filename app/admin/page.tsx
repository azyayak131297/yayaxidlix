"use client"

import type { FormEvent } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
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

type NetworkFormData = {
  networkId: string
  networkName: string
  backdropUrl: string
  color: string
}

type SubmitState = "idle" | "submitting" | "success" | "error"

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

const emptyNetwork: NetworkFormData = {
  networkId: "",
  networkName: "",
  backdropUrl: "",
  color: "#1a1a2e",
}

type Tab = "quick" | "content" | "video" | "network" | "manage"

export default function AdminPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<Tab>("quick")

  const [contentForm, setContentForm] = useState<ContentFormData>({ ...emptyContent })
  const [videoForm, setVideoForm] = useState<VideoFormData>({ ...emptyVideo })
  const [networkForm, setNetworkForm] = useState<NetworkFormData>({ ...emptyNetwork })
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [allGenres, setAllGenres] = useState<{ id: number; name: string }[]>([])
  const [showGenreGrid, setShowGenreGrid] = useState(false)

  const [contentState, setContentState] = useState<SubmitState>("idle")
  const [videoState, setVideoState] = useState<SubmitState>("idle")
  const [networkState, setNetworkState] = useState<SubmitState>("idle")
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session?.user) {
      router.replace("/login")
    }
  }, [session, status, router])

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const res = await fetch("/api/genres")
        const json = await res.json()
        if (json.data) {
          setAllGenres(json.data)
        }
      } catch {
        // use empty fallback
      }
    }
    loadGenres()
  }, [])

  if (status === "loading") {
    return null
  }

  if (!session?.user) {
    router.replace("/login")
    return null
  }

  const toggleGenre = (id: number) => {
    setSelectedGenres((prev) => {
      const next = prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
      const names = next.map((gid) => allGenres.find((g) => g.id === gid)?.name || "").filter(Boolean)
      setContentForm((f) => ({ ...f, genres: names.join(", ") }))
      return next
    })
  }

  const handleContentSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setContentState("submitting")
    setMessage(null)

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: contentForm.title,
          overview: contentForm.overview || null,
          posterPath: contentForm.posterPath || null,
          backdropPath: contentForm.backdropPath || null,
          releaseYear: contentForm.releaseYear ? Number(contentForm.releaseYear) : null,
          rating: contentForm.rating ? Number(contentForm.rating) : null,
          durationMinutes: contentForm.durationMinutes ? Number(contentForm.durationMinutes) : null,
          genres: contentForm.genres || null,
          type: contentForm.type,
          seasons: contentForm.type === "tv" && contentForm.seasons ? Number(contentForm.seasons) : null,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Gagal menyimpan konten")
      }

      const data = await res.json()
      setContentState("success")
      setMessage(`✅ Konten berhasil disimpan dengan ID: ${data.id}`)
      setContentForm({ ...emptyContent })
      setSelectedGenres([])
    } catch (err) {
      setContentState("error")
      setMessage(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setContentState("idle")
    }
  }

  const handleVideoSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setVideoState("submitting")
    setMessage(null)

    try {
      const key = `custom-${contentForm.title.toLowerCase().replace(/\s+/g, "-") || "video"}`
      const res = await fetch("/api/admin/video-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          key,
          contentType: "custom",
          source: {
            type: videoForm.type,
            url: videoForm.url.trim(),
            label: videoForm.label.trim() || undefined,
            quality: videoForm.quality.trim() || undefined,
          },
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Gagal menyimpan video source")
      }

      setVideoState("success")
      setMessage(`✅ Video source berhasil disimpan dengan key: ${key}`)
      setVideoForm({ ...emptyVideo })
    } catch (err) {
      setVideoState("error")
      setMessage(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setVideoState("idle")
    }
  }

  const handleNetworkSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setNetworkState("submitting")
    setMessage(null)

    try {
      const res = await fetch("/api/admin/network-backdrops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          networkId: networkForm.networkId,
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

      setNetworkState("success")
      setMessage("✅ Network backdrop berhasil disimpan!")
      setNetworkForm({ ...emptyNetwork })
    } catch (err) {
      setNetworkState("error")
      setMessage(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setNetworkState("idle")
    }
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "quick", label: "Tambah Cepat", icon: "🚀" },
    { id: "content", label: "Konten", icon: "📝" },
    { id: "video", label: "Video", icon: "🎬" },
    { id: "network", label: "Network", icon: "📺" },
    { id: "manage", label: "Kelola", icon: "⚙️" },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-zinc-400 mt-1">Kelola konten, video, dan pengaturan situs.</p>
          </div>
        </div>

        <div className="flex gap-1 mb-8 overflow-x-auto pb-2 border-b border-zinc-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-zinc-900 text-red-400 border-b-2 border-red-400"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.startsWith("✅")
                ? "bg-green-900/30 border-green-700 text-green-300"
                : "bg-red-900/30 border-red-700 text-red-300"
            }`}
          >
            <p className="whitespace-pre-wrap text-sm">{message}</p>
          </div>
        )}

        {activeTab === "quick" && (
          <section className="space-y-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-xl font-bold mb-1">Tambah Konten & Video Sekaligus</h2>
              <p className="text-zinc-400 text-sm mb-6">
                Isi data konten dan video source dalam satu form. Setelah submit, konten langsung aktif.
              </p>

              <form onSubmit={handleContentSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipe Konten</label>
                    <select
                      value={contentForm.type}
                      onChange={(e) => setContentForm((f) => ({ ...f, type: e.target.value as "movie" | "tv" }))}
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
                      value={contentForm.title}
                      onChange={(e) => setContentForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Contoh: Avengers: Endgame"
                      className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Sinopsis</label>
                  <textarea
                    value={contentForm.overview}
                    onChange={(e) => setContentForm((f) => ({ ...f, overview: e.target.value }))}
                    rows={3}
                    placeholder="Deskripsi singkat konten..."
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">URL Poster</label>
                    <input
                      value={contentForm.posterPath}
                      onChange={(e) => setContentForm((f) => ({ ...f, posterPath: e.target.value }))}
                      placeholder="https://..."
                      className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL Backdrop</label>
                    <input
                      value={contentForm.backdropPath}
                      onChange={(e) => setContentForm((f) => ({ ...f, backdropPath: e.target.value }))}
                      placeholder="https://..."
                      className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tahun Rilis</label>
                    <input
                      value={contentForm.releaseYear}
                      onChange={(e) => setContentForm((f) => ({ ...f, releaseYear: e.target.value }))}
                      placeholder="2025"
                      className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rating</label>
                    <input
                      value={contentForm.rating}
                      onChange={(e) => setContentForm((f) => ({ ...f, rating: e.target.value }))}
                      placeholder="7.5"
                      className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Durasi (menit)</label>
                    <input
                      value={contentForm.durationMinutes}
                      onChange={(e) => setContentForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                      placeholder="90"
                      className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Genre</label>
                    <button
                      type="button"
                      onClick={() => setShowGenreGrid(!showGenreGrid)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      {showGenreGrid ? "Sembunyikan genre" : "Pilih genre"}
                    </button>
                  </div>

                  {showGenreGrid && (
                    <div className="mb-3 p-3 rounded-lg border border-zinc-700 bg-zinc-950">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {allGenres.map((genre) => (
                          <label
                            key={genre.id}
                            className={`flex items-center gap-2 rounded border px-3 py-2 cursor-pointer transition-colors ${
                              selectedGenres.includes(genre.id)
                                ? "border-red-500 bg-red-900/20"
                                : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedGenres.includes(genre.id)}
                              onChange={() => toggleGenre(genre.id)}
                              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-xs text-zinc-200">{genre.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <input
                    value={contentForm.genres}
                    onChange={(e) => {
                      setContentForm((f) => ({ ...f, genres: e.target.value }))
                      const ids = e.target.value
                        .split(",")
                        .map((g) => g.trim().toLowerCase())
                        .filter(Boolean)
                        .map((name) => allGenres.find((g) => g.name.toLowerCase() === name)?.id || 0)
                        .filter((id): id is number => id > 0)
                      setSelectedGenres(ids)
                    }}
                    placeholder="Action, Drama, Sci-Fi"
                    className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                  />
                </div>

                {contentForm.type === "tv" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Jumlah Musim</label>
                    <input
                      value={contentForm.seasons}
                      onChange={(e) => setContentForm((f) => ({ ...f, seasons: e.target.value }))}
                      placeholder="1"
                      className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                    />
                  </div>
                )}

                <hr className="border-zinc-800 my-6" />

                <div>
                  <h3 className="text-lg font-bold mb-4">🎬 Sumber Video</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipe Sumber Video</label>
                      <select
                        value={videoForm.type}
                        onChange={(e) => setVideoForm((f) => ({ ...f, type: e.target.value as VideoFormData["type"] }))}
                        className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                      >
                        <option value="youtube">▶ YouTube</option>
                        <option value="archive">📦 Archive.org</option>
                        <option value="vimeo">🎬 Vimeo</option>
                        <option value="direct">🔗 Direct URL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">URL Video *</label>
                      <input
                        required
                        value={videoForm.url}
                        onChange={(e) => setVideoForm((f) => ({ ...f, url: e.target.value }))}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Label (opsional)</label>
                      <input
                        value={videoForm.label}
                        onChange={(e) => setVideoForm((f) => ({ ...f, label: e.target.value }))}
                        placeholder="YouTube, Archive, dll"
                        className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Kualitas (opsional)</label>
                      <input
                        value={videoForm.quality}
                        onChange={(e) => setVideoForm((f) => ({ ...f, quality: e.target.value }))}
                        placeholder="720p, 1080p"
                        className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={contentState === "submitting"}
                  className="w-full rounded bg-red-600 px-4 py-3 text-sm font-bold hover:bg-red-500 disabled:opacity-60 transition-colors"
                >
                  {contentState === "submitting" ? "⏳ Menyimpan..." : "🚀 Simpan Konten & Video"}
                </button>
              </form>
            </div>
          </section>
        )}

        {activeTab === "content" && (
          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-bold mb-4">📝 Kelola Konten</h2>
            <p className="text-zinc-400 text-sm mb-6">Tambah, edit, atau hapus konten yang sudah ada.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/admin/content" className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600 transition-colors">
                <h3 className="font-semibold text-white mb-1">Konten Custom</h3>
                <p className="text-xs text-zinc-400">Kelola konten custom.</p>
              </Link>
              <Link href="/admin/local" className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600 transition-colors">
                <h3 className="font-semibold text-white mb-1">Konten Lokal</h3>
                <p className="text-xs text-zinc-400">Kelola konten dari file lokal.</p>
              </Link>
              <Link href="/admin/import" className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600 transition-colors">
                <h3 className="font-semibold text-white mb-1">Import Konten</h3>
                <p className="text-xs text-zinc-400">Import banyak konten sekaligus.</p>
              </Link>
            </div>
          </section>
        )}

        {activeTab === "video" && (
          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-bold mb-4">🎬 Kelola Video</h2>
            <p className="text-zinc-400 text-sm mb-6">Tambah atau ubah sumber video untuk konten.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/admin/videos" className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600 transition-colors">
                <h3 className="font-semibold text-white mb-1">Video Source</h3>
                <p className="text-xs text-zinc-400">Kelola video movie/custom.</p>
              </Link>
              <Link href="/admin/videos/episodes" className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600 transition-colors">
                <h3 className="font-semibold text-white mb-1">Episode Series</h3>
                <p className="text-xs text-zinc-400">Kelola video episode series.</p>
              </Link>
            </div>
          </section>
        )}

        {activeTab === "network" && (
          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-bold mb-4">📺 Jaringan Backdrops</h2>
            <p className="text-zinc-400 text-sm mb-6">Atur backdrop dan warna untuk setiap jaringan.</p>
            <form onSubmit={handleNetworkSubmit} className="space-y-4">
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
            </form>
          </section>
        )}

        {activeTab === "manage" && (
          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-bold mb-4">⚙️ Pengaturan & Manajemen</h2>
            <p className="text-zinc-400 text-sm mb-6">Kelola pengaturan situs dan konten yang sudah ada.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/admin/content" className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600 transition-colors">
                <h3 className="font-semibold text-white mb-1">📝 Kelola Konten</h3>
                <p className="text-xs text-zinc-400">Tambah, edit, atau hapus konten.</p>
              </Link>
              <Link href="/admin/local" className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600 transition-colors">
                <h3 className="font-semibold text-white mb-1">📁 Kelola Konten Lokal</h3>
                <p className="text-xs text-zinc-400">Kelola konten dari file lokal.</p>
              </Link>
              <Link href="/admin/videos" className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600 transition-colors">
                <h3 className="font-semibold text-white mb-1">🎬 Kelola Video Source</h3>
                <p className="text-xs text-zinc-400">Ubah URL, tipe, atau kualitas video.</p>
              </Link>
              <Link href="/admin/settings" className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600 transition-colors">
                <h3 className="font-semibold text-white mb-1">⚙️ Pengaturan Situs</h3>
                <p className="text-xs text-zinc-400">Ubah judul, warna, dan fitur situs.</p>
              </Link>
              <Link href="/admin/import" className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600 transition-colors">
                <h3 className="font-semibold text-white mb-1">📥 Import Konten</h3>
                <p className="text-xs text-zinc-400">Import banyak konten sekaligus.</p>
              </Link>
              <Link href="/admin/videos/episodes" className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600 transition-colors">
                <h3 className="font-semibold text-white mb-1">🎞️ Episode Series</h3>
                <p className="text-xs text-zinc-400">Kelola video episode series.</p>
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}