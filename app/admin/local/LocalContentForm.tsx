"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ImageUpload from "@/components/ImageUpload"

type LocalContentFormData = {
  type: "movie" | "tv"
  title: string
  overview: string
  posterPath: string
  backdropPath: string
  releaseYear: string
  rating: string
  durationMinutes: string
  genres: string
  seasons: string
}

type Props = {
  id?: string
  initial?: Partial<LocalContentFormData>
  submitLabel?: string
}

const emptyForm: LocalContentFormData = {
  type: "movie",
  title: "",
  overview: "",
  posterPath: "",
  backdropPath: "",
  releaseYear: "",
  rating: "",
  durationMinutes: "",
  genres: "",
  seasons: "",
}

export default function LocalContentForm({ id, initial, submitLabel = "Simpan" }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<LocalContentFormData>({ ...emptyForm, ...initial })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [allGenres, setAllGenres] = useState<{ id: number; name: string }[]>([])
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([])

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await fetch(`/api/genres`)
        const json = await res.json()
        if (json.data) {
          setAllGenres(json.data)
        }
      } catch {
        // use empty fallback
      }
    }
    fetchGenres()
  }, [])

  useEffect(() => {
    if (initial?.genres && allGenres.length > 0) {
      const names = (initial.genres as string).split(",").map((g) => g.trim()).filter(Boolean)
      const ids = names
        .map((name) => {
          const found = allGenres.find((g) => g.name.toLowerCase() === name.toLowerCase())
          return found?.id
        })
        .filter((id): id is number => !!id)
      setSelectedGenreIds(ids)
      setForm((prev) => ({ ...prev, genres: initial.genres || "" }))
    } else if (!initial?.genres) {
      setSelectedGenreIds([])
    }
  }, [initial?.genres, allGenres])

  const update = (field: keyof LocalContentFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleGenre = (genreId: number) => {
    setSelectedGenreIds((prev) => {
      const next = prev.includes(genreId) ? prev.filter((gid) => gid !== genreId) : [...prev, genreId]
      const names = next.map((gid) => allGenres.find((g) => g.id === gid)?.name || "").filter(Boolean)
      update("genres", names.join(", "))
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const payload = {
      action: id ? "upsert" : "upsert",
      id,
      content: {
        type: form.type,
        title: form.title,
        overview: form.overview,
        posterPath: form.posterPath,
        backdropPath: form.backdropPath,
        releaseYear: form.releaseYear ? Number(form.releaseYear) : null,
        rating: form.rating ? Number(form.rating) : null,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : null,
        genres: form.genres.split(",").map((g) => g.trim()).filter(Boolean),
        seasons: form.seasons ? Number(form.seasons) : null,
      },
    }

    try {
      const res = await fetch(`/api/admin/local-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan")
      setSuccess("Konten lokal berhasil disimpan.")
      router.push("/admin/local")
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded border border-red-800 bg-red-950/40 p-3 text-sm text-red-200">{error}</div>}
      {success && <div className="rounded border border-green-800 bg-green-950/40 p-3 text-sm text-green-200">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Jenis</label>
          <select className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={form.type} onChange={(e) => update("type", e.target.value)}>
            <option value="movie">Film</option>
            <option value="tv">Series</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Judul</label>
          <input className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-zinc-300 mb-1">Deskripsi</label>
          <textarea className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" rows={4} value={form.overview} onChange={(e) => update("overview", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Tahun Rilis</label>
          <input type="number" className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={form.releaseYear} onChange={(e) => update("releaseYear", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Rating</label>
          <input type="number" step="0.1" className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={form.rating} onChange={(e) => update("rating", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Durasi (menit)</label>
          <input type="number" className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={form.durationMinutes} onChange={(e) => update("durationMinutes", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1">Musim (untuk series)</label>
          <input type="number" className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={form.seasons} onChange={(e) => update("seasons", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-zinc-300 mb-2">Genre</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {allGenres.map((genre) => (
              <label key={genre.id} className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 cursor-pointer hover:border-zinc-500 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedGenreIds.includes(genre.id)}
                  onChange={() => toggleGenre(genre.id)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-500"
                />
                <span className="text-xs text-zinc-200">{genre.name}</span>
              </label>
            ))}
          </div>
          <input type="hidden" value={form.genres} onChange={(e) => update("genres", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <ImageUpload label="Poster" value={form.posterPath} onChange={(url) => update("posterPath", url)} />
        </div>
        <div className="md:col-span-2">
          <ImageUpload label="Backdrop" value={form.backdropPath} onChange={(url) => update("backdropPath", url)} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="rounded bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-500 transition-colors disabled:opacity-60">
          {loading ? "Menyimpan..." : submitLabel}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-400 transition-colors">
          Batal
        </button>
      </div>
    </form>
  )
}