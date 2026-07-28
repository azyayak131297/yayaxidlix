"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const hasGoogle = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true"

  const handleLocalLogin = async (e: React.FormEvent) => {
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
    <div className="space-y-4">
      <form onSubmit={handleLocalLogin} className="space-y-3">
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

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-black px-2 text-zinc-400">Atau</span>
        </div>
      </div>

      {hasGoogle ? (
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full rounded bg-white text-black font-semibold py-3 hover:bg-zinc-200 transition-colors"
        >
          Masuk dengan Google
        </button>
      ) : (
        <p className="text-xs text-zinc-500 text-center">
          Google OAuth belum aktif. Setelah ditambahkan <code className="rounded bg-zinc-800 px-1 py-0.5">GOOGLE_CLIENT_ID</code> dan <code className="rounded bg-zinc-800 px-1 py-0.5">GOOGLE_CLIENT_SECRET</code>, tombol Google akan muncul.
        </p>
      )}
    </div>
  )
}