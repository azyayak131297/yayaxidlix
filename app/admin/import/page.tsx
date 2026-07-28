import { Header } from "@/components/Header"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminImportPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Import Konten</h1>
            <p className="text-zinc-400 mt-1">Import banyak konten sekaligus dari file JSON atau CSV.</p>
          </div>
          <Link href="/admin" className="rounded border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-400 transition-colors">
            ← Kembali ke Admin
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <form action="/api/admin/import" method="POST" encType="multipart/form-data" className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Pilih File (JSON atau CSV)</label>
              <input type="file" name="file" accept=".json,.csv" required className="block w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500" />
              <p className="text-[11px] text-zinc-500 mt-1">Mendukung format JSON array atau CSV dengan header.</p>
            </div>

            <div className="rounded border border-zinc-700 bg-zinc-950 p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Format JSON</h3>
              <pre className="text-xs text-zinc-300 overflow-x-auto">{`[
  {"id": "local-1", "type": "movie", "title": "Film A", "overview": "...", "posterPath": "https://...", "backdropPath": "https://...", "releaseYear": 2024, "rating": 7.5, "durationMinutes": 120, "genres": ["Action"], "seasons": null},
  {"id": "local-2", "type": "tv", "title": "Series B", ...}
]`}</pre>
            </div>

            <div className="rounded border border-zinc-700 bg-zinc-950 p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Format CSV</h3>
              <pre className="text-xs text-zinc-300 overflow-x-auto">{`title,type,overview,posterPath,backdropPath,releaseYear,rating,durationMinutes,genres,seasons
Film A,movie,Deskripsi...,https://...,https://...,2024,7.5,120,Action;Adventure,
Series B,tv,Deskripsi...,https://...,https://...,2023,8.0,45,Drama;Thriller,2`}</pre>
            </div>

            <button type="submit" className="rounded bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-500 transition-colors">
              Import
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}