import { loadLocalContent } from "@/lib/local-content"
import { Header } from "@/components/Header"
import LocalContentForm from "../../LocalContentForm"
import Link from "next/link"

export const dynamic = "force-dynamic"

type EditPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditLocalContentPage({ params }: EditPageProps) {
  const { id } = await params
  const contents = loadLocalContent()
  const item = contents.find((c) => c.id === id)

  if (!item) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl font-bold mb-4">Konten tidak ditemukan</h1>
          <Link href="/admin/local" className="text-red-400 hover:underline">← Kembali ke daftar</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Edit Konten Lokal</h1>
            <p className="text-zinc-400 mt-1">Perbarui detail konten lokal.</p>
          </div>
          <Link href="/admin/local" className="rounded border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-400 transition-colors">
            ← Kembali
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <LocalContentForm
            id={item.id}
            initial={{
              type: item.type,
              title: item.title,
              overview: item.overview,
              posterPath: item.posterPath,
              backdropPath: item.backdropPath,
              releaseYear: item.releaseYear ? String(item.releaseYear) : "",
              rating: item.rating ? String(item.rating) : "",
              durationMinutes: item.durationMinutes ? String(item.durationMinutes) : "",
              genres: item.genres.join(", "),
              seasons: item.seasons ? String(item.seasons) : "",
            }}
            submitLabel="Simpan Perubahan"
          />
        </div>
      </main>
    </div>
  )
}