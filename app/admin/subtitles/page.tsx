import { prisma } from "@/lib/prisma"
import { Header } from "@/components/Header"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminSubtitlesPage({
  searchParams,
}: {
  searchParams: Promise<{ contentId?: string; contentType?: string }>
}) {
  const params = await searchParams
  const contentId = params?.contentId || ""
  const contentType = params?.contentType || ""

  const subtitles = await prisma.subtitle.findMany({
    where: {
      ...(contentId && { contentId }),
      ...(contentType && { contentType }),
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Kelola Subtitle</h1>
            <p className="text-zinc-400 mt-1">Tambah atau ubah subtitle untuk konten video.</p>
          </div>
          <Link href="/admin" className="rounded border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-400 transition-colors">
            ← Kembali ke Admin
          </Link>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <form className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <label className="block text-xs font-medium text-zinc-400 mb-1" htmlFor="contentId">Content ID</label>
            <input
              id="contentId"
              type="text"
              name="contentId"
              defaultValue={contentId}
              placeholder="contoh: local-31"
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
            />
          </form>

          <form className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <label className="block text-xs font-medium text-zinc-400 mb-1" htmlFor="contentType">Content Type</label>
            <select
              id="contentType"
              name="contentType"
              defaultValue={contentType}
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white"
            >
              <option value="">Semua</option>
              <option value="movie">Movie</option>
              <option value="tv">TV</option>
            </select>
          </form>

          <div className="flex items-end">
            <button type="submit" className="w-full rounded bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm font-medium hover:border-zinc-400 transition-colors">
              Filter
            </button>
          </div>
          <div className="flex items-end">
            <Link href="/admin/subtitles" className="w-full rounded border border-zinc-700 px-4 py-2 text-sm font-medium text-center hover:border-zinc-400 transition-colors">
              Reset
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <Link href="/admin/subtitles/new" className="rounded bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-500 transition-colors">
            + Tambah Subtitle
          </Link>
        </div>

        {subtitles.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            Belum ada subtitle.
          </div>
        ) : (
          <div className="space-y-3">
            {subtitles.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-white truncate">{item.label}</h3>
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-200">{item.language}</span>
                    {item.isDefault && <span className="text-xs text-red-400">Default</span>}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {item.contentType} • {item.contentId}
                    {item.episodeKey ? ` • ${item.episodeKey}` : ""}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{item.url}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/subtitles/edit/${item.id}`} className="rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700 transition-colors">
                    Edit
                  </Link>
                  <form action={`/api/admin/subtitles/${item.id}`} method="POST" onSubmit={(e) => { if (!confirm("Yakin ingin menghapus subtitle ini?")) e.preventDefault(); }}>
                    <input type="hidden" name="_method" value="DELETE" />
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
