import { prisma } from "@/lib/prisma"
import { Header } from "@/components/Header"
import Link from "next/link"
import DeleteButton from "./DeleteButton"
import QuickVideoForm from "@/components/QuickVideoForm"
import CloneButton from "@/components/CloneButton"
import AdminContentBulkClient from "./AdminContentBulkClient"

export const dynamic = "force-dynamic"

type AdminContentPageProps = {
  searchParams: Promise<{ q?: string; type?: string }>
}

export default async function AdminContentPage({ searchParams }: AdminContentPageProps) {
  const params = await searchParams
  const query = (params.q || "").trim().toLowerCase()
  const typeFilter = (params.type || "").trim() as "movie" | "tv" | ""

  let contents = await prisma.customContent.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, type: true, releaseYear: true, rating: true, genres: true, viewCount: true, createdAt: true, updatedAt: true },
  })

  if (query) {
    contents = contents.filter((c) => c.title.toLowerCase().includes(query) || (c.genres || "").toLowerCase().includes(query))
  }
  if (typeFilter) {
    contents = contents.filter((c) => c.type === typeFilter)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Kelola Konten</h1>
            <p className="text-zinc-400 mt-1">Tambah, edit, atau hapus konten custom.</p>
          </div>
          <Link href="/admin" className="rounded border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-400 transition-colors">
            ← Kembali ke Admin
          </Link>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <form className="flex-1" method="GET">
            <input type="text" name="q" defaultValue={query} placeholder="Cari judul atau genre..." className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white" />
          </form>
          <form className="flex gap-2">
            <select name="type" defaultValue={typeFilter} className="rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white">
              <option value="">Semua Jenis</option>
              <option value="movie">Film</option>
              <option value="tv">Series</option>
            </select>
            <button type="submit" className="rounded bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700 transition-colors">Filter</button>
          </form>
          <Link href="/admin/content/new" className="rounded bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-500 transition-colors">
            + Tambah
          </Link>
        </div>

        {contents.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            Belum ada konten custom. Klik tombol di atas untuk menambahkan.
          </div>
        ) : (
          <form action="/api/admin/content/bulk" method="POST" className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-950 p-3">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="select-all" className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-500" />
                <label htmlFor="select-all" className="text-xs text-zinc-300">
                  Pilih semua ({contents.length})
                </label>
              </div>
              <button type="submit" className="rounded bg-red-900/40 border border-red-800 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-900/70 transition-colors">
                Hapus yang dipilih
              </button>
            </div>
            {contents.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    name="ids"
                    value={item.id}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-red-500 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-medium text-white truncate">{item.title || "Tanpa Judul"}</h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      {item.type === "tv" ? "Series" : "Film"}
                      {item.releaseYear ? ` • ${item.releaseYear}` : ""}
                      {item.rating ? ` • ⭐ ${Number(item.rating).toFixed(1)}` : ""}
                      {item.viewCount ? ` • 👁 ${item.viewCount}` : ""}
                      {item.genres ? ` • ${item.genres}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <Link href={`/admin/content/edit/${item.id}`} className="rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium hover:bg-zinc-700 transition-colors">
                    Edit
                  </Link>
                  <CloneButton id={item.id} title={item.title} />
                  <QuickVideoForm contentId={item.id} contentType={item.type as "movie" | "tv" | "custom"} />
                  <DeleteButton id={item.id} />
                </div>
              </div>
            ))}
          </form>
        )}
      </main>
      <AdminContentBulkClient />
    </div>
  )
}