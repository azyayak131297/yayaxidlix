"use client"

import { useState, useRef } from "react"

type ImageUploadProps = {
  value?: string
  onChange: (url: string) => void
  label?: string
}

export default function ImageUpload({ value, onChange, label = "Gambar" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Gagal upload")

      const url = json.url
      onChange(url)
      setPreview(url)
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat upload")
    } finally {
      setUploading(false)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    onChange(url)
    setPreview(url)
  }

  const clearImage = () => {
    onChange("")
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-zinc-300">{label}</label>

      {preview && (
        <div className="relative w-full h-40 rounded-lg overflow-hidden bg-zinc-800">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button type="button" onClick={clearImage} className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80">
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700 transition-colors disabled:opacity-60">
          {uploading ? "Mengupload..." : "Upload Gambar"}
        </button>
      </div>

      <input className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={value || ""} onChange={handleUrlChange} placeholder="Atau masukkan URL gambar..." />

      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </div>
  )
}