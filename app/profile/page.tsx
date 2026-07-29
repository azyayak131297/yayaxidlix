import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ProfileForm from "./ProfileForm"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const userId = (session.user as any).id as string
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Profil Saya</h1>
            <p className="text-zinc-400 text-sm mt-1">Kelola informasi akun kamu</p>
          </div>

          <ProfileForm user={user} />
        </div>
      </main>
    </div>
  )
}
