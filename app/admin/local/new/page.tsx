import { Header } from "@/components/Header"
import LocalContentForm from "../LocalContentForm"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default function NewLocalContentPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Tambah Konten Lokal</h1>
            <p className="text-zinc-400 mt-1">Isi detail konten lokal yang ingin ditambahkan.</p>
          </div>
          <Link href="/admin/local" className="rounded border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-400 transition-colors">
            ← Kembali
          </Link>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <LocalContentForm submitLabel="Tambah Konten" />
        </div>
      </main>
    </div>
  )
}