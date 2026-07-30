"use client"

import { useEffect, useState } from "react"

type EmbedType = "archive" | "youtube" | "vimeo" | "direct" | "doodstream" | "none"

interface VideoSource {
  type: EmbedType
  url: string
  label?: string
  quality?: string
}

function resolveEmbedUrl(source: VideoSource): string {
  switch (source.type) {
    case "archive": {
      const match = source.url.match(/archive\.org\/details\/([^?&]+)/)
      if (match) {
        return `https://archive.org/embed/${match[1]}`
      }
      return `https://archive.org/embed/${source.url}`
    }
    case "youtube": {
      const videoIdMatch = source.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^?&]+)/)
      if (videoIdMatch) {
        return `https://www.youtube.com/embed/${videoIdMatch[1]}`
      }
      return source.url
    }
    case "vimeo": {
      const vimeoMatch = source.url.match(/vimeo\.com\/(\d+)/)
      if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`
      }
      return source.url
    }
    case "doodstream": {
      const match = source.url.match(/(?:dood|playmogo)\.(?:la|to|com)\/e\/([^?&]+)/)
      if (match) {
        return `https://dood.la/e/${match[1]}`
      }
      return source.url
    }
    case "direct":
    default:
      return source.url
  }
}

export function VideoPlayer({
  source,
  title = "Video Player",
}: {
  source?: VideoSource | null
  title?: string
}) {
  const [embedType, setEmbedType] = useState<EmbedType>("none")
  const [embedUrl, setEmbedUrl] = useState<string>("")

  useEffect(() => {
    if (source) {
      setEmbedType(source.type)
      setEmbedUrl(resolveEmbedUrl(source))
    } else {
      setEmbedType("none")
      setEmbedUrl("")
    }
  }, [source])

  if (embedType === "none" || !embedUrl) {
    return (
      <div className="relative w-full aspect-video bg-zinc-900 rounded-lg flex items-center justify-center">
        <div className="text-center px-4 py-8">
          <div className="text-zinc-400 text-4xl mb-4">🎬</div>
          <h3 className="text-white text-lg font-medium mb-2">Video belum tersedia</h3>
          <p className="text-zinc-500 text-sm mb-4 max-w-md">
            Konten ini belum memiliki sumber video. Anda bisa menambahkan video melalui file{" "}
            <code className="text-zinc-300">data/video-sources.json</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        {embedType === "doodstream" && (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={title}
          />
        )}
        {embedType === "archive" && (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={title}
          />
        )}
        {embedType === "youtube" && (
          <iframe
            src={`${embedUrl}?autoplay=0&rel=0&modestbranding=1`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        )}
        {embedType === "vimeo" && (
          <iframe
            src={`${embedUrl}?autoplay=0`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={title}
          />
        )}
        {embedType === "direct" && (
          <video
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            controls
            autoPlay={false}
            title={title}
          >
            Browser Anda tidak mendukung tag video.
          </video>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-400">Sumber:</span>
        <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300 capitalize font-medium">
          {embedType === "archive" && "Archive.org"}
          {embedType === "youtube" && "YouTube"}
          {embedType === "vimeo" && "Vimeo"}
          {embedType === "direct" && "Direct URL"}
        </span>
        {embedUrl && (
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
          >
            Buka di tab baru ↗
          </a>
        )}
      </div>
    </div>
  )
}
