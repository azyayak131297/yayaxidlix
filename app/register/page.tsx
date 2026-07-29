"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Header } from "@/components/Header"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Registrasi gagal")
      }

      setSuccess("Registrasi berhasil! Mengarahkan ke halaman login...")
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat registrasi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Buat Akun</h1>
            <p className="text-zinc-400 text-sm mt-1">Daftar untuk menyimpan watchlist dan riwayat menonton</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-800 bg-red-950/40 p-3">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg border border-green-800 bg-green-950/40 p-3">
              <p className="text-sm text-green-200">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">Nama</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
                placeholder="Nama kamu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
                placeholder="email@contoh.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">Konfirmasi Password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
                placeholder="Ulangi password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-red-600 px-4 py-3 text-sm font-bold hover:bg-red-500 disabled:opacity-60 transition-colors"
            >
              {loading ? "Mendaftar..." : "Daftar"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-400 mt-4">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-red-400 hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
