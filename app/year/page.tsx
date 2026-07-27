import { fetchYears } from "@/lib/tmdb"
import { Header } from "@/components/Header"
import Link from "next/link"

export const dynamic = "force-dynamic"

const FILM_STRIP_PATTERN = {
  backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(220,38,38,0.06) 2px, rgba(220,38,38,0.06) 4px)`,
}

async function getYears() {
  const years = await fetchYears()
  return years.sort((a, b) => b - a)
}

export default async function YearPage() {
  const years = await getYears()

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-red-900/8 rounded-full blur-[180px]" />
      </div>
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={FILM_STRIP_PATTERN} />
      <Header />
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative mb-10">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-24 bg-gradient-to-b from-red-600 to-transparent rounded-full" />
          <h1 className="text-3xl font-extrabold text-red-400 mb-2 tracking-tight">Tahun</h1>
          <p className="text-zinc-400 text-sm md:text-base">
            Jelajahi film dan series berdasarkan tahun rilis <span className="text-red-400">•</span> Arsiteval
          </p>
        </div>

        {years.length === 0 ? (
          <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-black" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(220,38,38,0.1)_0%,_transparent_70%)]" />
            <div className="relative flex flex-col items-center justify-center py-24 px-6 text-center">
              <div className="w-24 h-24 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 border border-zinc-700">
                <span className="text-4xl">📅</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-200 mb-2">Tahun belum tersedia</h2>
              <p className="text-zinc-500 text-sm max-w-md">
                Isi <code className="text-red-400 bg-zinc-800 px-1.5 py-0.5 rounded text-xs">TMDB_API_KEY</code> di{" "}
                <code className="text-red-400 bg-zinc-800 px-1.5 py-0.5 rounded text-xs">.env</code> untuk memuat daftar tahun.
              </p>
              <Link
                href="/admin"
                className="mt-6 inline-flex items-center gap-2 rounded bg-red-600 px-5 py-2.5 text-sm font-semibold hover:bg-red-500 transition-colors"
              >
                Tambah Konten Manual
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {years.map((year) => (
              <Link
                key={year}
                href={`/year/${year}`}
                className="group relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <span className="text-2xl font-extrabold text-zinc-200 group-hover:text-red-400 transition-colors">
                    {year}
                  </span>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600/90 text-[10px] font-bold text-white">
                    ▶
                  </span>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-red-600/10 to-transparent" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}