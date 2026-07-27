import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Header } from "@/components/Header"
import Image from "next/image"
import Link from "next/link"

export const dynamic = "force-dynamic"

async function getWatchlistItems() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id
  if (!userId) return []

  const items = await prisma.watchlist.findMany({
    where: { userId },
    select: { contentId: true, contentType: true, createdAt: true }
  })

  return items
}

export default async function WatchlistPage() {
  const items = await getWatchlistItems()

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mb-2">Watchlist</h1>
        <p className="text-zinc-400 mb-8">
          {items.length > 0 ? `${items.length} item di watchlist` : "Watchlist kamu kosong"}
        </p>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⭐</div>
            <h2 className="text-xl font-semibold mb-2">Belum ada item</h2>
            <p className="text-zinc-400">Tambah konten ke watchlist dari halaman detail film atau series.</p>
            <Link href="/" className="text-red-400 hover:underline mt-4 inline-block">
              ← Jelajah konten
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item: any) => (
              <Link
                key={`watchlist-${item.contentId}`}
                href={item.contentType === "tv" ? `/series/${item.contentId}` : `/movie/${item.contentId}`}
                className="group relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-zinc-800"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <span className="text-center text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
                    {item.contentType === "tv" ? "📺" : "🎬"} {item.contentId}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}