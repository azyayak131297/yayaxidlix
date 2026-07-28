import { prisma } from "@/lib/prisma"
import { loadVideoSources } from "@/lib/video-sources"
import { Header } from "@/components/Header"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminVideosPage() {
  const [customContents, videoSources] = await Promise.all([
    prisma.customContent.findMany({ select: { id: true, title: true, type: true } }),
    Promise.resolve(loadVideoSources()),
  ])

  const customVideos = Object.entries(videoSources.custom).map(([key, source]) => ({
    key,
    ...source,
    contentType: "custom",
  }))

  const movieVideos = Object.entries(videoSources.movies).map(([key, source]) => ({
    key,
    ...source,
    contentType: "movie",
  }))

  const episodeVideos = Object.entries(videoSources.series.episodes).map(([key, source]) => ({
    key,
    ...source,
    contentType: "tv-episode",
  }))

  const allVideos = [...customVideos, ...movieVideos, ...episodeVideos]

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
        </div>

        {allVideos.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            Belum ada video source. Klik tombol di atas untuk menambahkan.
          </div>
        ) : (
          <div className="space-y-3">
            {allVideos.map((item) => (
              <div key={item.key} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <div className="min-w-0">
                  <h3 className="font-medium text-white truncate">{item.label || item.url}</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {item.contentType === "custom" ? "Custom" : item.contentType === "movie" ? "Film TMDB" : "Episode Series"} • {item.type}
                    {item.quality ? ` • ${item.quality}` : ""}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{item.key}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
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