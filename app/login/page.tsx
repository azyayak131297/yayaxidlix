import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import LoginForm from "./LoginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-extrabold mb-2 text-center">Login</h1>
        <p className="text-zinc-400 text-center mb-8">Masuk untuk menyimpan watchlist dan akses fitur lain.</p>
        <LoginForm />
        <p className="text-center text-sm text-zinc-400 mt-6">
          Belum punya akun?{" "}
          <a href="/register" className="text-red-400 hover:underline">
            Daftar
          </a>
        </p>
      </div>
    </div>
  )
}