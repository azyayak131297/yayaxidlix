import { Header } from "@/components/Header"
import Link from "next/link"

const COLLECTIONS = [
  { id: 10, name: "Avengers Saga", poster: "https://image.tmdb.org/t/p/w500/kAvNC1RNhMF5Rz9TGiCaLd4YnBM.jpg", year: "2012" },
  { id: 18, name: "The Lord of the Rings Trilogy", poster: "https://image.tmdb.org/t/p/w500/6EOpgWmr0m6E6PX5DwRhO61oTMN.jpg", year: "2001" },
  { id: 140, name: "Harry Potter Collection", poster: "https://image.tmdb.org/t/p/w500/qlm5E8eB1fb5sBrEKY1Cb85MZF2.jpg", year: "2001" },
  { id: 61, name: "Spider-Man Ultimate", poster: "https://image.tmdb.org/t/p/w500/bNbnAn7YnK0c0Yk9d67B0d4Mh2B.jpg", year: "2002" },
  { id: 165, name: "John Wick Collection", poster: "https://image.tmdb.org/t/p/w500/pXB0M1qMk3eN2rYxJ3Z1k3Y1Y1F.jpg", year: "2014" },
  { id: 437, name: "The Fast Saga", poster: "https://image.tmdb.org/t/p/w500/3xL6aMnQ6pYJ9WqK1lL3e3e3e3e.jpg", year: "2001" },
  { id: 2024340, name: "DCEU Saga", poster: "https://image.tmdb.org/t/p/w500/5bFK5D3mVTAv0XFZ0dU2Q5Y0n6m.png", year: "2013" },
  { id: 37193, name: "Pixar Collection", poster: "https://image.tmdb.org/t/p/w500/2DlmBnRhbiX37N7h8L3U0HdEb5J.jpg", year: "1995" },
]

COLLECTIONS.sort((a, b) => a.name.localeCompare(b.name))

const FILM_STRIP_PATTERN = {
  backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(220,38,38,0.06) 2px, rgba(220,38,38,0.06) 4px)`,
}

export default async function CollectionPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-900/8 rounded-full blur-[180px]" />
      </div>
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true" style={FILM_STRIP_PATTERN} />
      <Header />
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative mb-10">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-24 bg-gradient-to-b from-red-600 to-transparent rounded-full" />
          <h1 className="text-3xl font-extrabold text-red-400 mb-2 tracking-tight">Koleksi</h1>
          <p className="text-zinc-400 text-sm md:text-base">
            Eksplorasi franchise film favoritmu <span className="text-red-400">•</span> Collections
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {COLLECTIONS.map((collection) => (
            <Link
              key={collection.id}
              href={`/collection/${collection.id}`}
              className="group relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex items-end p-4">
                <span className="text-sm font-semibold text-zinc-200 group-hover:text-red-400 transition-colors leading-tight">
                  {collection.name}
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
      </main>
    </div>
  )
}
