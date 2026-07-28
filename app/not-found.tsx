import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center px-4">
        <h1 className="text-6xl font-extrabold text-red-600 mb-4">404</h1>
        <p className="text-xl text-zinc-300 mb-8">Halaman yang kamu cari tidak ditemukan.</p>
        <Link href="/" className="rounded bg-red-600 px-6 py-3 font-bold hover:bg-red-500 transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}