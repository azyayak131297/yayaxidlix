import { NextResponse } from "next/server"
import { loadSiteSettings, saveSiteSettings, type SiteSettings } from "@/lib/site-settings"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const settings = loadSiteSettings()
    return NextResponse.json({ data: settings })
  } catch (error) {
    console.error("Error fetching site settings:", error)
    return NextResponse.json({ message: "Gagal memuat pengaturan" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const settings = body.data as SiteSettings

    if (!settings || !settings.site || !settings.features) {
      return NextResponse.json({ message: "Data pengaturan tidak valid" }, { status: 400 })
    }

    saveSiteSettings(settings)
    return NextResponse.json({ data: settings, message: "Pengaturan berhasil disimpan" })
  } catch (error) {
    console.error("Error saving site settings:", error)
    return NextResponse.json({ message: "Gagal menyimpan pengaturan" }, { status: 500 })
  }
}