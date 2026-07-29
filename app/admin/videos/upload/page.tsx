"use client"

import { useState, useCallback, FormEvent } from "react"
import { Header } from "@/components/Header"
import Link from "next/link"

type Provider = "internet-archive" | "doodstream" | "youtube"

export default function AdminUploadPage() {
  const [provider, setProvider] = useState<Provider>("internet-archive")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [identifier, setIdentifier] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const generateIdentifier = useCallback((text: string) => {
    const slug = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    const random = Math.random().toString(36).substring(2, 8)
    return `${slug}-${random}`
  }, [])

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTitle(value)
    if (!identifier && provider === "internet-archive") {
      setIdentifier(generateIdentifier(value))
    }
  }, [identifier, provider, generateIdentifier])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setEmbedUrl(null)
    setVideoUrl(null)

    if (!file && provider !== "youtube") {
      setError("Please select a video file.")
      return
    }

    if (!title.trim()) {
      setError("Title is required.")
      return
    }

    if (provider === "internet-archive" && !identifier.trim()) {
      setError("Identifier is required for Internet Archive.")
      return
    }

    if (provider === "youtube" && !videoUrl?.trim()) {
      setError("YouTube URL is required.")
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("provider", provider)
      formData.append("title", title.trim())
      formData.append("description", description.trim())

      if (provider === "internet-archive") {
        formData.append("identifier", identifier.trim())
        formData.append("file", file as Blob)
      }

      if (provider === "youtube") {
        formData.append("videoUrl", videoUrl?.trim() || "")
      }

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Upload failed")
      }

      if (provider === "internet-archive") {
        setSuccess("Video uploaded to Internet Archive successfully!")
        setEmbedUrl(`https://archive.org/embed/${identifier.trim()}`)
      } else if (provider === "doodstream") {
        setSuccess("Video uploaded to DoodStream successfully!")
        setEmbedUrl(data.embedUrl)
      } else if (provider === "youtube") {
        setSuccess("YouTube video added successfully!")
        setEmbedUrl(data.embedUrl || videoUrl)
      }

      setTitle("")
      setDescription("")
      setIdentifier(generateIdentifier(""))
      setFile(null)
      setVideoUrl(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Upload Video</h1>
            <p className="text-zinc-400 mt-1">Upload a video and save the source for playback.</p>
          </div>
          <Link href="/admin/videos" className="rounded border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-400 transition-colors">
            &larr; Back
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 p-4">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-800 bg-green-950/40 p-4">
            <p className="text-sm text-green-200">{success}</p>
            {embedUrl && (
              <p className="mt-2 text-xs text-green-400 break-all">
                Embed URL: <a href={embedUrl} target="_blank" rel="noopener noreferrer" className="underline">{embedUrl}</a>
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Provider</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "internet-archive", label: "Internet Archive" },
                { value: "doodstream", label: "DoodStream" },
                { value: "youtube", label: "YouTube" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setProvider(option.value as Provider)}
                  className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
                    provider === option.value
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {provider === "internet-archive" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="file">Video File</label>
                <input
                  id="file"
                  type="file"
                  accept="video/*"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white file:text-zinc-300 file:bg-zinc-800 file:border-0 file:px-3 file:py-1"
                />
                <p className="text-xs text-zinc-500 mt-1">Common formats: MP4, WebM, MKV, MOV</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="identifier">Identifier *</label>
                <input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="my-video-abc123"
                  className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Unique name for this item on archive.org (lowercase, hyphens allowed). Auto-generated from the title when empty.
                </p>
              </div>
            </>
          )}

          {provider === "doodstream" && (
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="file">Video File</label>
              <input
                id="file"
                type="file"
                accept="video/*"
                required
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white file:text-zinc-300 file:bg-zinc-800 file:border-0 file:px-3 file:py-1"
              />
              <p className="text-xs text-zinc-500 mt-1">Max file size: 5GB (free), 20GB (premium). Supported: MP4, AVI, MOV, MKV</p>
            </div>
          )}

          {provider === "youtube" && (
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="videoUrl">YouTube Video URL *</label>
              <input
                id="videoUrl"
                type="url"
                required
                value={videoUrl || ""}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Paste a YouTube video URL. Set video as Unlisted if you don&apos;t want it public.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="My Awesome Video"
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="A brief description of the video..."
              className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-red-600 px-4 py-3 text-sm font-bold hover:bg-red-500 disabled:opacity-60 transition-colors"
          >
            {submitting ? "Uploading..." : `Upload to ${provider === "internet-archive" ? "Internet Archive" : provider === "doodstream" ? "DoodStream" : "Add YouTube Video"}`}
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="text-sm font-semibold mb-2">Provider Information</h2>
          {provider === "internet-archive" && (
            <div className="text-xs text-zinc-400 space-y-2">
              <p>Internet Archive is a non-profit digital library offering unlimited free storage and bandwidth for public content.</p>
              <p>Setup:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to <a href="https://archive.org/account/s3" target="_blank" rel="noopener noreferrer" className="text-red-400 underline">https://archive.org/account/s3</a></li>
                <li>Request your S3 Access Key and Secret Key</li>
                <li>Add them to your <code className="bg-zinc-800 px-1 rounded">.env</code> file</li>
              </ol>
              <div className="bg-zinc-950 rounded p-3 font-mono text-xs text-zinc-300">
                <p>INTERNET_ARCHIVE_ACCESS_KEY=your_access_key_here</p>
                <p>INTERNET_ARCHIVE_SECRET_KEY=your_secret_key_here</p>
              </div>
            </div>
          )}
          {provider === "doodstream" && (
            <div className="text-xs text-zinc-400 space-y-2">
              <p>DoodStream is a video hosting service with monetization options. Free tier includes 5GB max file size and 60-day retention for inactive files.</p>
              <p>Setup:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to <a href="https://doodstream.com/settings" target="_blank" rel="noopener noreferrer" className="text-red-400 underline">https://doodstream.com/settings</a></li>
                <li>Copy your API Key</li>
                <li>Add it to your <code className="bg-zinc-800 px-1 rounded">.env</code> file</li>
              </ol>
              <div className="bg-zinc-950 rounded p-3 font-mono text-xs text-zinc-300">
                <p>DOODSTREAM_API_KEY=your_api_key_here</p>
              </div>
              <p className="text-zinc-500">Premium: $7.99/month for 20GB uploads and ad-free viewing.</p>
            </div>
          )}
          {provider === "youtube" && (
            <div className="text-xs text-zinc-400 space-y-2">
              <p>YouTube is the world&apos;s largest video sharing platform. Use Unlisted videos to keep them private but embeddable.</p>
              <p>Steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Upload your video to YouTube</li>
                <li>Set visibility to <strong>Unlisted</strong></li>
                <li>Copy the video URL and paste it above</li>
              </ol>
              <p className="text-zinc-500">No API key required. Unlimited storage and bandwidth.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
