import { NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import { join } from "node:path"
import { loadNetworkBackdrops, upsertNetworkBackdrop } from "@/lib/network-backdrops"

const NETWORK_BACKDROPS_PATH = join(process.cwd(), "data", "network-backdrops.json")

export async function GET() {
  try {
    const data = loadNetworkBackdrops()
    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error reading network backdrops:", error)
    return NextResponse.json({ message: "Gagal memuat network backdrops" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, networkId, backdrop } = body as {
      action: "upsert" | "delete"
      networkId?: string
      backdrop?: { network: string; backdropUrl: string; color: string }
    }

    if (action === "delete") {
      if (!networkId) {
        return NextResponse.json({ message: "networkId wajib diisi untuk delete" }, { status: 400 })
      }
      const data = loadNetworkBackdrops()
      delete data.backdrops[String(networkId)]
      await fs.writeFile(NETWORK_BACKDROPS_PATH, JSON.stringify(data, null, 2), "utf-8")
      return NextResponse.json({ data, message: "Network backdrop berhasil dihapus" })
    }

    if (action === "upsert") {
      if (!networkId || !backdrop) {
        return NextResponse.json({ message: "networkId dan backdrop wajib diisi" }, { status: 400 })
      }
      const saved = upsertNetworkBackdrop(networkId, backdrop)
      return NextResponse.json({ data: saved, message: "Network backdrop berhasil disimpan" })
    }

    return NextResponse.json({ message: "Action tidak dikenali" }, { status: 400 })
  } catch (error) {
    console.error("Error saving network backdrop:", error)
    return NextResponse.json({ message: "Gagal menyimpan network backdrop" }, { status: 500 })
  }
}