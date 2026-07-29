"use client"

import { useState, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Session } from "next-auth"

type ProfileFormProps = {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    createdAt: Date
  }
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [name, setName] = useState(user.name || "")
  const [email, setEmail] = useState(user.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const session = localStorage.getItem("next-auth.session")
    // Session is managed by NextAuth
  }, [])

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui profil")
      }

      setSuccess("Profil berhasil diperbarui!")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (!currentPassword || !newPassword) {
      setError("Semua field password harus diisi")
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter")
      setLoading(false)
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError("Password baru dan konfirmasi tidak cocok")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Gagal mengganti password")
      }

      setSuccess("Password berhasil diubah!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/40 p-3">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-800 bg-green-950/40 p-3">
          <p className="text-sm text-green-200">{success}</p>
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <h2 className="text-lg font-semibold">Informasi Profil</h2>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">Nama</label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
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
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-500 disabled:opacity-60 transition-colors"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="space-y-4 border-t border-zinc-800 pt-6">
        <h2 className="text-lg font-semibold">Ganti Password</h2>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="currentPassword">Password Saat Ini</label>
          <input
            id="currentPassword"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="newPassword">Password Baru</label>
          <input
            id="newPassword"
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="confirmNewPassword">Konfirmasi Password Baru</label>
          <input
            id="confirmNewPassword"
            type="password"
            required
            minLength={6}
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-500 disabled:opacity-60 transition-colors"
        >
          {loading ? "Menyimpan..." : "Ganti Password"}
        </button>
      </form>

      <div className="text-xs text-zinc-500 border-t border-zinc-800 pt-4">
        <p>Akun dibuat: {new Date(user.createdAt).toLocaleDateString("id-ID")}</p>
      </div>
    </div>
  )
}
