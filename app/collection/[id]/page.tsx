import { Header } from "@/components/Header"
import Image from "next/image"
import Link from "next/link"

type CollectionDetailPageProps = {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { id } = await params
  const collectionId = Number(id)

  let collectionData: any = null
  let parts: any[] = []

  try {
    const [colRes, partsRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/collection/${collectionId}?api_key=${process.env.TMDB_API_KEY}&language=id-ID`, {
        next: { revalidate: 86400 }
      }),
      fetch(`https://api.themoviedb.org/3/collection/${collectionId}/parts?api_key=${process.env.TMDB_API_KEY}&language=id-ID&page=1`, {
        next: { revalidate: 3600 }
      })
    ])

    if (colRes.ok) collectionData = await colRes.json()
    if (partsRes.ok) {
      const partsJson = await partsRes.json()
      parts = partsJson.results || []
    }
  } catch {
    // handled silently
  }

  const name = collectionData?.name || "Collection"
  const posterPath = collectionData?.poster_path || ""
  const overview = collectionData?.overview || ""
  const partsToShow = parts.filter((p: any) => p.media_type === "movie" || p.media_type === "tv")

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link href="/collection" className="text-zinc-400 hover:text-white text-sm mb-4 inline-block">
            ← Kembali ke Collections
          </Link>
          <h1 className="text-3xl font-bold">{name}</h1>
          {overview && <p className="text-zinc-400 mt-2 max-w-2xl">{overview}</p>}
        </div>

        {partsToShow.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎬</div>
            <h2 className="text-xl font-semibold mb-2">Tidak ada bagian</h2>
            <p className="text-zinc-400">Collection ini tidak memiliki bagian yang tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {partsToShow.map((item: any) => (
              <Link
                key={`${item.media_type || "movie"}-${item.id}`}
                href={item.media_type === "tv" ? `/series/${item.id}` : `/movie/${item.id}`}
                className="group"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-800 mb-2">
                  {item.poster_path ? (
                    <Image
                      src={item.poster_path}
                      alt={item.title || item.name}
                      fill
                      className="object-cover transition-opacity duration-200 group-hover:opacity-80"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-500 text-xs">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                <h3 className="text-sm font-medium text-zinc-100 truncate group-hover:text-white transition-colors">
                  {item.title || item.name}
                </h3>
                <p className="text-xs text-zinc-400 truncate">
                  {item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || "TBA"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}