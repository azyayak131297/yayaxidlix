import { NextResponse } from "next/server"
import { loadVideoSources } from "@/lib/video-sources"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const apiKey = process.env.DOODSTREAM_API_KEY

    if (!apiKey) {
      return NextResponse.json({ message: "DoodStream API key is not configured" }, { status: 500 })
    }

    const [accountRes, reportsRes] = await Promise.all([
      fetch(`https://doodapi.co/api/account/info?key=${encodeURIComponent(apiKey)}`),
      fetch(`https://doodapi.co/api/account/reports?key=${encodeURIComponent(apiKey)}`),
    ])

    const accountData = await accountRes.json()
    const reportsData = await reportsRes.json()

    if (!accountRes.ok || accountData.status !== 200) {
      return NextResponse.json({ message: `Failed to fetch DoodStream account info: ${accountData.msg}` }, { status: accountRes.status })
    }

    const videoSources = loadVideoSources()
    const localDoodStreamFiles = Object.entries(videoSources.custom)
      .filter(([, source]) => source.type === "doodstream")
      .map(([key, source]) => ({ key, ...source }))

    return NextResponse.json({
      account: accountData.result,
      reports: reportsData.result || [],
      localFiles: localDoodStreamFiles,
    })
  } catch (error) {
    console.error("DoodStream earnings error:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch DoodStream earnings" },
      { status: 500 }
    )
  }
}
