import Image from "next/image"

export function Footer() {
  return (
    <footer className="relative border-t border-zinc-800 bg-black mt-auto overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <Image
          src="https://image.tmdb.org/t/p/original/kAvNC1RNhMF5Rz9TGiCaLd4YnBM.jpg"
          alt=""
          fill
          className="object-cover opacity-[0.07] scale-110"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(220,38,38,0.12)_0%,_transparent_60%)]" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="text-red-500 font-extrabold text-xl tracking-tight">IDLIX</span>
              <span className="text-zinc-600 text-xs font-medium hidden sm:inline">Hybrid Streaming</span>
            </div>
            <p className="text-zinc-500 text-xs max-w-xs text-center md:text-left">
              Gabungkan film TMDB dengan konten manual untuk pengalaman menonton terbaik.
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium" aria-label="Footer navigation">
            <a href="/" className="text-zinc-400 hover:text-red-400 transition-colors">Beranda</a>
            <a href="/genre" className="text-zinc-400 hover:text-red-400 transition-colors">Genre</a>
            <a href="/country" className="text-zinc-400 hover:text-red-400 transition-colors">Negara</a>
            <a href="/year" className="text-zinc-400 hover:text-red-400 transition-colors">Tahun</a>
            <a href="/network" className="text-zinc-400 hover:text-red-400 transition-colors">Jaringan</a>
            <a href="/watchlist" className="text-zinc-400 hover:text-red-400 transition-colors">Watchlist</a>
            <a href="/admin" className="text-zinc-400 hover:text-red-400 transition-colors">Admin</a>
          </nav>
          <p className="text-zinc-600 text-xs">
            {new Date().getFullYear()} IDLIX. All rights reserved.
          </p>
        </div>
        <div className="mt-8 pt-6 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-600 text-xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>Streaming HD — Film &amp; Series Terbaru</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-700 text-xs">
            <span>TMDB</span>
            <span className="text-zinc-800">•</span>
            <span>Archive.org</span>
            <span className="text-zinc-800">•</span>
            <span>YouTube</span>
          </div>
        </div>
      </div>
    </footer>
  )
}