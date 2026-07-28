import { loadLocalContent } from "@/lib/local-content"
import { Header } from "@/components/Header"
import { ContentCard } from "@/components/ContentCard"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function LocalBrowsePage() {
  const contents = loadLocalContent()

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Konten Lokal</h1>
          <p className="text-zinc-400 mt-1">Konten yang disimpan di file lokal tanpa TMDB.</p>
        </div>

        {contents.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            Belum ada konten lokal. Edit file <code className="rounded bg-zinc-800 px-1 py-0.5 text-xs">data/local-content.json</code> untuk menambahkan.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {contents.map((item) => (
              <ContentCard
                key={item.id}
                id={item.id}
                title={item.title}
                posterPath={item.posterPath}
                releaseDate={item.releaseYear ? String(item.releaseYear) : undefined}
                mediaType={item.type}
                href={item.type === "tv" ? `/watch/tv/${item.id}` : `/watch/movie/${item.id}`}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}