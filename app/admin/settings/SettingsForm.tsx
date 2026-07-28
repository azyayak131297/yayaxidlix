"use client"

import { useState, useEffect } from "react"

type SiteSettingsData = {
  site: {
    title: string
    description: string
    accentColor: string
    logoText: string
  }
  features: {
    showTmdb: boolean
    showLocal: boolean
    showTrailer: boolean
    showCast: boolean
  }
  backgrounds: {
    homeGenre: string
    homeCountry: string
    homeYear: string
    homeNetwork: string
  }
}

const defaultSettings: SiteSettingsData = {
  site: {
    title: "IDLIX",
    description: "Platform streaming pribadi",
    accentColor: "#dc2626",
    logoText: "IDLIX",
  },
  features: {
    showTmdb: true,
    showLocal: true,
    showTrailer: true,
    showCast: true,
  },
  backgrounds: {
    homeGenre: "https://picsum.photos/seed/genre-bg/600/400",
    homeCountry: "https://picsum.photos/seed/country-bg/600/400",
    homeYear: "https://picsum.photos/seed/year-bg/600/400",
    homeNetwork: "https://picsum.photos/seed/network-bg/600/400",
  },
}

export default function SettingsForm() {
  const [settings, setSettings] = useState<SiteSettingsData>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/admin/settings`)
        const json = await res.json()
        if (json.data) {
          setSettings(json.data)
        }
      } catch {
        setMessage("Gagal memuat pengaturan")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const update = (section: keyof SiteSettingsData, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/admin/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: settings }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan")
      setMessage("Pengaturan berhasil disimpan.")
    } catch (err: any) {
      setMessage(err.message || "Terjadi kesalahan")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-zinc-400">Memuat pengaturan...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`rounded p-3 text-sm ${message.startsWith("✅") || message.includes("berhasil") ? "bg-green-900/30 border border-green-700 text-green-300" : "bg-red-900/30 border border-red-700 text-red-300"}`}>
          {message}
        </div>
      )}

      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-bold mb-4">Tampilan Situs</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Judul Situs</label>
            <input className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={settings.site.title} onChange={(e) => update("site", "title", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Deskripsi</label>
            <input className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={settings.site.description} onChange={(e) => update("site", "description", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Teks Logo</label>
            <input className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={settings.site.logoText} onChange={(e) => update("site", "logoText", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Warna Aksen</label>
            <div className="flex items-center gap-3">
              <input type="color" className="h-10 w-16 rounded border border-zinc-700 bg-transparent p-1" value={settings.site.accentColor} onChange={(e) => update("site", "accentColor", e.target.value)} />
              <input className="flex-1 rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={settings.site.accentColor} onChange={(e) => update("site", "accentColor", e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-bold mb-4">Fitur</h2>
        <div className="space-y-3">
          {[
            { key: "showTmdb", label: "Tampilkan konten TMDB" },
            { key: "showLocal", label: "Tampilkan konten lokal" },
            { key: "showTrailer", label: "Tampilkan trailer" },
            { key: "showCast", label: "Tampilkan daftar pemeran" },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={(settings.features as any)[item.key]}
                onChange={(e) => update("features", item.key, e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-zinc-200">{item.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-bold mb-4">Background Homepage</h2>
        <p className="text-xs text-zinc-400 mb-4">Masukkan URL gambar untuk setiap section di homepage.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Genre Background URL</label>
            <input className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={settings.backgrounds.homeGenre} onChange={(e) => update("backgrounds", "homeGenre", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Negara Background URL</label>
            <input className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={settings.backgrounds.homeCountry} onChange={(e) => update("backgrounds", "homeCountry", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Tahun Background URL</label>
            <input className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={settings.backgrounds.homeYear} onChange={(e) => update("backgrounds", "homeYear", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Jaringan Background URL</label>
            <input className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" value={settings.backgrounds.homeNetwork} onChange={(e) => update("backgrounds", "homeNetwork", e.target.value)} />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="rounded bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-500 transition-colors disabled:opacity-60">
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>
    </form>
  )
}