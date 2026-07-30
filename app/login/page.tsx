"use client"

import { useState, FormEvent } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError("Username atau password salah")
      } else if (res?.ok) {
        window.location.href = "/"
      }
    } catch {
      setError("Terjadi kesalahan saat login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-2 text-center">Login</h1>
        <p className="text-zinc-400 text-center mb-8">Masuk untuk menyimpan watchlist dan akses fitur lain.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Username / Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white"
              placeholder="admin123"
              required
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-500 transition-colors disabled:opacity-60"
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400 mt-6">
          Belum punya akun?{" "}
          <Link href="/register" className="text-red-400 hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}
