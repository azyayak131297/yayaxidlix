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

export async function POST(request: Request) {
  const accessKey = process.env.INTERNET_ARCHIVE_ACCESS_KEY
  const secretKey = process.env.INTERNET_ARCHIVE_SECRET_KEY

  if (!accessKey || !secretKey) {
    return NextResponse.json(
      { message: "Internet Archive S3 credentials are not configured. Please set INTERNET_ARCHIVE_ACCESS_KEY and INTERNET_ARCHIVE_SECRET_KEY environment variables. Get your keys at https://archive.org/account/s3" },
      { status: 500 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const title = (formData.get("title") as string) || ""
    const description = (formData.get("description") as string) || ""
    const identifier = (formData.get("identifier") as string) || ""

    if (!file) {
      return NextResponse.json({ message: "File is required" }, { status: 400 })
    }

    if (!title.trim()) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 })
    }

    let finalIdentifier = identifier.trim()
    if (!finalIdentifier) {
      finalIdentifier = generateIdentifierFromTitle(title.trim())
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split(".").pop() || "mp4"
    const filename = `${finalIdentifier}.${ext}`
    const objectKey = `${finalIdentifier}/${filename}`

    const amzDate = getAmzDate()
    const dateStamp = getDateStamp(amzDate)
    const host = "s3.us.archive.org"
    const credentialScope = `${dateStamp}/us/s3/aws4_request`

    const blobContent = `application/octet-stream`
    const blobHash = sha256(buffer)

    const canonicalHeaders: Record<string, string> = {
      host,
      "x-amz-date": amzDate,
      "x-archive-meta-title": title.trim(),
      "x-archive-meta-description": description.trim(),
      "x-archive-meta-mediatype": "video",
      "x-archive-meta-collection": "media",
    }

    const canonicalUri = `/${objectKey}`
    const signedHeaders = Object.keys(canonicalHeaders)
      .map((k) => k.toLowerCase())
      .sort()
      .join(";")

    const canonicalRequest = buildCanonicalRequest("PUT", canonicalUri, canonicalHeaders, blobHash)
    const authHeader = buildAuthHeader(accessKey, secretKey, amzDate, "us", signedHeaders, canonicalRequest)

    const uploadUrl = `${IA_ENDPOINT}/${objectKey}`

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: authHeader,
        "x-amz-date": amzDate,
        "x-archive-meta-title": title.trim(),
        "x-archive-meta-description": description.trim(),
        "x-archive-meta-mediatype": "video",
        "x-archive-meta-collection": "media",
        "Content-Type": blobContent,
      },
      body: buffer,
    })

    if (!uploadRes.ok) {
      const errorBody = await uploadRes.text()
      console.error("Internet Archive upload error:", uploadRes.status, errorBody)
      return NextResponse.json(
        { message: `Failed to upload to Internet Archive (${uploadRes.status}): ${errorBody}` },
        { status: uploadRes.status }
      )
    }

    const videoSource: VideoSource = {
      type: "archive",
      url: `https://archive.org/embed/${finalIdentifier}`,
      label: `Internet Archive: ${title.trim()}`,
      quality: "720p",
    }

    const data = await loadVideoSources()
    data.custom[finalIdentifier] = videoSource
    await fs.writeFile(VIDEO_SOURCES_PATH, JSON.stringify(data, null, 2), "utf-8")
    invalidateVideoSourcesCache()

    return NextResponse.json({
      message: "Video uploaded to Internet Archive successfully",
      identifier: finalIdentifier,
      embedUrl: `https://archive.org/embed/${finalIdentifier}`,
      key: finalIdentifier,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { message: "An unexpected error occurred during upload" },
      { status: 500 }
    )
  }
}