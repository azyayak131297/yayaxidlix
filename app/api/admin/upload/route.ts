import { NextResponse } from "next/server"
import { promises as fs } from "node:fs"
import { join } from "node:path"
import { createHmac, createHash, randomBytes } from "node:crypto"
import { invalidateVideoSourcesCache } from "@/lib/video-sources"
import { VideoSource, loadVideoSources } from "@/lib/video-sources"

export const dynamic = "force-dynamic"

const IA_ENDPOINT = "https://s3.us.archive.org"
const VIDEO_SOURCES_PATH = join(process.cwd(), "data", "video-sources.json")

function hmacSha256(key: string, message: string): string {
  return createHmac("sha256", key).update(message).digest("hex")
}

function sha256(message: string | Buffer): string {
  return createHash("sha256").update(message).digest("hex")
}

function deriveSigningKey(secretKey: string, dateStamp: string): string {
  const kDate = hmacSha256("AWS4" + secretKey, dateStamp)
  const kRegion = hmacSha256(kDate, "us")
  const kService = hmacSha256(kRegion, "s3")
  return hmacSha256(kService, "aws4_request")
}

function getAmzDate(): string {
  return new Date().toISOString().replace(/[:-]|\.\d{3}/g, "").replace("T", "T").slice(0, 16) + "Z"
}

function getDateStamp(amzDate: string): string {
  return amzDate.slice(0, 8)
}

function buildAuthHeader(accessKey: string, secretKey: string, amzDate: string, region: string, signedHeaders: string, canonicalRequest: string): string {
  const dateStamp = getDateStamp(amzDate)
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n")

  const signingKey = deriveSigningKey(secretKey, dateStamp)
  const signature = hmacSha256(signingKey, stringToSign)

  return `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
}

function buildCanonicalRequest(method: string, canonicalUri: string, headers: Record<string, string>, payloadHash: string): string {
  const canonicalHeaders = Object.entries(headers)
    .map(([k, v]) => `${k.toLowerCase()}:${v.trim()}`)
    .sort((a, b) => a.localeCompare(b))
    .join("\n")
  const signedHeaders = Object.keys(headers)
    .map((k) => k.toLowerCase())
    .sort()
    .join(";")

  return [
    method,
    canonicalUri,
    "",
    canonicalHeaders,
    "",
    signedHeaders,
    payloadHash,
  ].join("\n")
}

function generateIdentifierFromTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50)
  const random = randomBytes(3).toString("hex")
  return `${slug}-${random}`
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^?&]+)/,
    /youtube\.com\/watch\?.*v=([^&]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

async function uploadToInternetArchive(file: File, title: string, description: string, identifier: string): Promise<{ key: string; embedUrl: string }> {
  const accessKey = process.env.INTERNET_ARCHIVE_ACCESS_KEY
  const secretKey = process.env.INTERNET_ARCHIVE_SECRET_KEY

  if (!accessKey || !secretKey) {
    throw new Error("Internet Archive S3 credentials are not configured. Please set INTERNET_ARCHIVE_ACCESS_KEY and INTERNET_ARCHIVE_SECRET_KEY environment variables. Get your keys at https://archive.org/account/s3")
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split(".").pop() || "mp4"
  const filename = `${identifier}.${ext}`
  const objectKey = `${identifier}/${filename}`

  const amzDate = getAmzDate()
  const dateStamp = getDateStamp(amzDate)
  const host = "s3.us.archive.org"

  const canonicalHeaders: Record<string, string> = {
    host,
    "x-amz-date": amzDate,
    "x-archive-meta-title": title,
    "x-archive-meta-description": description,
    "x-archive-meta-mediatype": "video",
    "x-archive-meta-collection": "media",
  }

  const canonicalUri = `/${objectKey}`
  const signedHeaders = Object.keys(canonicalHeaders)
    .map((k) => k.toLowerCase())
    .sort()
    .join(";")

  const blobHash = sha256(buffer)
  const canonicalRequest = buildCanonicalRequest("PUT", canonicalUri, canonicalHeaders, blobHash)
  const authHeader = buildAuthHeader(accessKey, secretKey, amzDate, "us", signedHeaders, canonicalRequest)

  const uploadUrl = `${IA_ENDPOINT}/${objectKey}`

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: authHeader,
      "x-amz-date": amzDate,
      "x-archive-meta-title": title,
      "x-archive-meta-description": description,
      "x-archive-meta-mediatype": "video",
      "x-archive-meta-collection": "media",
      "Content-Type": "application/octet-stream",
    },
    body: buffer,
  })

  if (!uploadRes.ok) {
    const errorBody = await uploadRes.text()
    console.error("Internet Archive upload error:", uploadRes.status, errorBody)
    throw new Error(`Failed to upload to Internet Archive (${uploadRes.status}): ${errorBody}`)
  }

  return {
    key: identifier,
    embedUrl: `https://archive.org/embed/${identifier}`,
  }
}

async function uploadToDoodStream(file: File, title: string, description: string): Promise<{ key: string; embedUrl: string }> {
  const apiKey = process.env.DOODSTREAM_API_KEY

  if (!apiKey) {
    throw new Error("DoodStream API key is not configured. Please set DOODSTREAM_API_KEY environment variable. Get your API key at https://doodstream.com/settings")
  }

  const uploadServerRes = await fetch(`https://doodapi.co/api/upload/server?key=${encodeURIComponent(apiKey)}`)
  const uploadServerData = await uploadServerRes.json()

  if (!uploadServerRes.ok || uploadServerData.status !== 200 || !uploadServerData.result) {
    throw new Error(`Failed to get DoodStream upload server: ${uploadServerData.msg || "Unknown error"}`)
  }

  const uploadUrl = uploadServerData.result
  const formData = new FormData()
  formData.append("api_key", apiKey)
  formData.append("file", file)

  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  })

  const uploadResult = await uploadRes.json()

  if (!uploadRes.ok || uploadResult.status !== 200 || !uploadResult.result?.filecode) {
    throw new Error(`Failed to upload to DoodStream: ${uploadResult.msg || "Unknown error"}`)
  }

  const fileCode = uploadResult.result.filecode
  const embedUrl = `https://dood.la/e/${fileCode}`

  return {
    key: fileCode,
    embedUrl,
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const provider = (formData.get("provider") as string) || "internet-archive"
    const title = (formData.get("title") as string) || ""
    const description = (formData.get("description") as string) || ""
    const file = formData.get("file") as File | null
    const identifier = (formData.get("identifier") as string) || ""
    const videoUrl = (formData.get("videoUrl") as string) || ""

    if (!title.trim()) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 })
    }

    let result: { key: string; embedUrl: string }

    if (provider === "internet-archive") {
      if (!file) {
        return NextResponse.json({ message: "File is required for Internet Archive upload" }, { status: 400 })
      }

      let finalIdentifier = identifier.trim()
      if (!finalIdentifier) {
        finalIdentifier = generateIdentifierFromTitle(title.trim())
      }

      result = await uploadToInternetArchive(file, title.trim(), description.trim(), finalIdentifier)

      const videoSource: VideoSource = {
        type: "archive",
        url: result.embedUrl,
        label: `Internet Archive: ${title.trim()}`,
        quality: "720p",
      }

      const data = await loadVideoSources()
      data.custom[result.key] = videoSource
      await fs.writeFile(VIDEO_SOURCES_PATH, JSON.stringify(data, null, 2), "utf-8")
      invalidateVideoSourcesCache()

      return NextResponse.json({
        message: "Video uploaded to Internet Archive successfully",
        identifier: result.key,
        embedUrl: result.embedUrl,
        key: result.key,
      })
    }

    if (provider === "doodstream") {
      if (!file) {
        return NextResponse.json({ message: "File is required for DoodStream upload" }, { status: 400 })
      }

      result = await uploadToDoodStream(file, title.trim(), description.trim())

      const videoSource: VideoSource = {
        type: "doodstream",
        url: result.embedUrl,
        label: `DoodStream: ${title.trim()}`,
        quality: "720p",
      }

      const data = await loadVideoSources()
      data.custom[result.key] = videoSource
      await fs.writeFile(VIDEO_SOURCES_PATH, JSON.stringify(data, null, 2), "utf-8")
      invalidateVideoSourcesCache()

      return NextResponse.json({
        message: "Video uploaded to DoodStream successfully",
        identifier: result.key,
        embedUrl: result.embedUrl,
        key: result.key,
      })
    }

    if (provider === "youtube") {
      if (!videoUrl.trim()) {
        return NextResponse.json({ message: "YouTube URL is required" }, { status: 400 })
      }

      const youtubeId = extractYouTubeId(videoUrl.trim())
      if (!youtubeId) {
        return NextResponse.json({ message: "Invalid YouTube URL" }, { status: 400 })
      }

      const embedUrl = `https://www.youtube.com/embed/${youtubeId}`
      const key = `yt-${youtubeId}`

      const videoSource: VideoSource = {
        type: "youtube",
        url: videoUrl.trim(),
        label: `YouTube: ${title.trim()}`,
        quality: "720p",
      }

      const data = await loadVideoSources()
      data.custom[key] = videoSource
      await fs.writeFile(VIDEO_SOURCES_PATH, JSON.stringify(data, null, 2), "utf-8")
      invalidateVideoSourcesCache()

      return NextResponse.json({
        message: "YouTube video added successfully",
        identifier: key,
        embedUrl,
        key,
      })
    }

    return NextResponse.json({ message: "Unsupported provider" }, { status: 400 })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An unexpected error occurred during upload" },
      { status: 500 }
    )
  }
}
