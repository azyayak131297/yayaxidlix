import { prisma } from "@/lib/prisma"
import { loadVideoSources } from "@/lib/video-sources"
import { Header } from "@/components/Header"
import Link from "next/link"

export const dynamic = "force-dynamic"

type VideoItem = {
  key: string
  type: string
  url: string
  label?: string
  quality?: string
  contentType: "custom" | "movie" | "tv-episode"
}

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; provider?: string }>
}) {
  const [customContents, videoSources, params] = await Promise.all([
    prisma.customContent.findMany({ select: { id: true, title: true, type: true } }),
    Promise.resolve(loadVideoSources()),
    searchParams,
  ])

  const query = (params?.q || "").toLowerCase().trim()
  const providerFilter = (params?.provider || "").toLowerCase().trim()

  const customVideos: VideoItem[] = Object.entries(videoSources.custom).map(([key, source]) => ({
    key,
    ...source,
    contentType: "custom" as const,
  }))

  const movieVideos: VideoItem[] = Object.entries(videoSources.movies).map(([key, source]) => ({
    key,
    ...source,
    contentType: "movie" as const,
  }))

  const episodeVideos: VideoItem[] = Object.entries(videoSources.series.episodes).map(([key, source]) => ({
    key,
    ...source,
    contentType: "tv-episode" as const,
  }))

  let allVideos = [...customVideos, ...movieVideos, ...episodeVideos]

  if (providerFilter) {
    allVideos = allVideos.filter((item) => item.type.toLowerCase() === providerFilter)
  }

  if (query) {
    allVideos = allVideos.filter(
      (item) =>
        item.label?.toLowerCase().includes(query) ||
        item.url.toLowerCase().includes(query) ||
        item.key.toLowerCase().includes(query)
    )
  }

  const providerCounts = allVideos.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1
    return acc
  }, {})

  const getProviderBadge = (type: string) => {
    const colors: Record<string, string> = {
      archive: "bg-zinc-800 text-zinc-200",
      youtube: "bg-red-900/40 text-red-200",
      vimeo: "bg-blue-900/40 text-blue-200",
      direct: "bg-green-900/40 text-green-200",
      doodstream: "bg-purple-900/40 text-purple-200",
    }
    return colors[type] || "bg-zinc-800 text-zinc-200"
  }

  const getWatchHref = (item: VideoItem) => {
    if (item.contentType === "custom") {
      return `/watch/movie/${item.key}`
    }
    if (item.contentType === "movie") {
      return `/watch/movie/${item.key}`
    }
    return `/watch/tv/${item.key.split("_s")[0]}`
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Kelola Video</h1>
            <p className="text-zinc-400 mt-1">Tambah atau ubah sumber video untuk konten.</p>
          </div>
          <Link href="/admin" className="rounded border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-400 transition-colors">
            ← Kembali ke Admin
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link href="/admin/videos/new" className="rounded bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-500 transition-colors">
            + Tambah Video Source
          </Link>
          <Link href="/admin/videos/episodes" className="rounded border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-400 transition-colors">
            + Kelola Episode Series
          </Link>
          <Link href="/admin/videos/upload" className="rounded border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-400 transition-colors">
            + Upload Video
          </Link>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <form className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <label className="block text-xs font-medium text-zinc-400 mb-1" htmlFor="q">Search</label>
            <input
              id="q"
              type="search"
              name="q"
              defaultValue={params?.q || ""}
              placeholder="Cari label, URL, atau key..."
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
            />
          </form>

          <form className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <label className="block text-xs font-medium text-zinc-400 mb-1" htmlFor="provider">Provider</label>
            <select
              id="provider"
              name="provider"
              defaultValue={params?.provider || ""}
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white"
            >
              <option value="">Semua Provider</option>
              {Object.keys(providerCounts).map((provider) => (
                <option key={provider} value={provider}>
                  {provider} ({providerCounts[provider]})
                </option>
              ))}
            </select>
          </form>

          <div className="flex items-end">
            <button type="submit" className="w-full rounded bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm font-medium hover:border-zinc-400 transition-colors">
              Filter
            </button>
          </div>
          <div className="flex items-end">
            <Link href="/admin/videos" className="w-full rounded border border-zinc-700 px-4 py-2 text-sm font-medium text-center hover:border-zinc-400 transition-colors">
              Reset
            </Link>
          </div>
        </div>

        {allVideos.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            {query || providerFilter ? "Tidak ada video source yang cocok dengan filter." : "Belum ada video source. Klik tombol di atas untuk menambahkan."}
          </div>
        ) : (
          <div className="space-y-3">
            {allVideos.map((item) => (
              <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-white truncate">{item.label || item.url}</h3>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${getProviderBadge(item.type)}`}>{item.type}</span>
                    {item.quality && <span className="text-xs text-zinc-400">{item.quality}</span>}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {item.contentType === "custom" ? "Custom" : item.contentType === "movie" ? "Film TMDB" : "Episode Series"}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{item.key}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={getWatchHref(item)} target="_blank" className="rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700 transition-colors">
                    Tonton
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(item.url)
                      alert("URL copied to clipboard")
                    }}
                    className="rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700 transition-colors"
                  >
                    Copy URL
                  </button>
                  <Link href={`/admin/videos/edit/${encodeURIComponent(item.key)}?contentType=${item.contentType}`} className="rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700 transition-colors">
                    Edit
                  </Link>
                  <form action={`/api/admin/video-sources`} method="POST" onSubmit={(e) => { if (!confirm("Yakin ingin menghapus video source ini?")) e.preventDefault(); }}>
                    <input type="hidden" name="action" value="delete" />
                    <input type="hidden" name="key" value={item.key} />
                    {item.contentType === "movie" && <input type="hidden" name="contentType" value="movie" />}
                    <button type="submit" className="rounded bg-red-900/40 border border-red-800 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-900/70 transition-colors">
                      Hapus
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}