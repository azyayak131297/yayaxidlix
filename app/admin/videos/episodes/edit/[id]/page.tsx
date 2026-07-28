import { Header } from "@/components/Header"
import EpisodeVideoForm from "../../EpisodeVideoForm"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default function EditEpisodeVideoPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Edit Video Episode</h1>
            <p className="text-zinc-400 mt-1">Perbarui URL, tipe, atau kualitas video episode.</p>
          </div>
          <Link href="/admin/videos/episodes" className="rounded border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-400 transition-colors">
            ← Kembali
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <EpisodeVideoForm />
        </div>
      </main>
    </div>
  )
}