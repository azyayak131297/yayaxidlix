"use client"

import { useEffect, useRef, useState } from "react"

type VideoProgressProps = {
  contentId: string
  contentType: "movie" | "tv"
  episodeKey?: string
  source?: { type: "archive" | "youtube" | "vimeo" | "direct" | "doodstream"; url: string } | null
  poster?: string
  onProgress?: (seconds: number) => void
}

export function VideoProgress({
  contentId,
  contentType,
  episodeKey,
  source,
  poster,
  onProgress,
}: {
  contentId: string
  contentType: "movie" | "tv"
  episodeKey?: string
  source?: { type: "archive" | "youtube" | "vimeo" | "direct" | "doodstream"; url: string } | null
  poster?: string
  onProgress?: (seconds: number) => void
}) {
  const [savedProgress, setSavedProgress] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const playerRef = useRef<HTMLIFrameElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/video-progress?contentId=${encodeURIComponent(contentId)}&contentType=${contentType}${episodeKey ? `&episodeKey=${encodeURIComponent(episodeKey)}` : ""}`)
        const json = await res.json()
        if (json.data && json.data.progressSeconds > 0) {
          setSavedProgress(json.data.progressSeconds)
        }
      } catch {
        // ignore
      }
    }
    fetchProgress()
  }, [contentId, contentType, episodeKey])

  const saveProgress = async (seconds: number) => {
    try {
      await fetch("/api/video-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, contentType, episodeKey, progressSeconds: Math.floor(seconds), durationSeconds: Math.floor(duration) }),
      })
    } catch {
      // ignore
    }
  }

  const trackView = async () => {
    try {
      await fetch("/api/track-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, contentType }),
      })
    } catch {
      // ignore
    }
  }

  const startTracking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (videoRef.current) {
        const time = videoRef.current.currentTime
        setCurrentTime(time)
        onProgress?.(time)
        saveProgress(time)
      } else if (playerRef.current && playerRef.current.contentWindow) {
        // For YouTube iframe, we can try to get current time via postMessage
        // This is a simplified approach
        playerRef.current.contentWindow.postMessage('{"event":"getCurrentTime"}', "*")
      }
    }, 5000)
  }

  const handleVideoPlay = () => {
    setIsPlaying(true)
    trackView()
    startTracking()
  }

  const handleVideoPause = () => {
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
    trackView()
  }

  const seekTo = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds
      setCurrentTime(seconds)
    }
  }

  const retryVideo = () => {
    setVideoError(false)
    setIsLoading(true)
    if (videoRef.current) {
      videoRef.current.load()
    }
  }

  if (!source) {
    return (
      <div className="relative w-full aspect-video bg-zinc-900 rounded-lg flex items-center justify-center">
        <div className="text-center px-4 py-8">
          <div className="text-zinc-400 text-4xl mb-4">🎬</div>
          <h3 className="text-white text-lg font-medium mb-2">Video belum tersedia</h3>
          <p className="text-zinc-500 text-sm mb-4 max-w-md">
            Konten ini belum memiliki sumber video. Anda bisa menambahkan video melalui admin panel.
          </p>
        </div>
      </div>
    )
  }

  const embedUrl = resolveEmbedUrl(source)
  const isDirect = source.type === "direct"
  const isYouTube = source.type === "youtube"
  const isDoodStream = source.type === "doodstream"

  return (
    <div className="space-y-2">
      {savedProgress !== null && savedProgress > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900 p-3">
          <span className="text-xs text-zinc-400">Terakhir menonton: {formatTime(savedProgress)}</span>
          <button
            type="button"
            onClick={() => seekTo(savedProgress)}
            className="rounded bg-red-600 px-3 py-1 text-xs font-bold hover:bg-red-500 transition-colors"
          >
            ▶ Lanjutkan
          </button>
        </div>
      )}

      {isDirect ? (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          {videoError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
              <div className="text-zinc-400 text-4xl mb-4">⚠️</div>
              <h3 className="text-white text-lg font-medium mb-2">Gagal memuat video</h3>
              <p className="text-zinc-500 text-sm mb-4 max-w-md text-center px-4">
                Video tidak dapat dimuat. Periksa koneksi internet atau coba lagi.
              </p>
              <button
                type="button"
                onClick={retryVideo}
                className="rounded bg-red-600 px-4 py-2 text-sm font-bold hover:bg-red-500 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}
          {isLoading && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
              <div className="text-zinc-400 text-sm">Loading video...</div>
            </div>
          )}
          <video
            ref={videoRef}
            src={source.url}
            poster={poster}
            className="w-full h-full"
            controls
            controlsList="nodownload"
            preload="metadata"
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              handleLoadedMetadata()
              setIsLoading(false)
            }}
            onWaiting={() => setIsLoading(true)}
            onCanPlay={() => setIsLoading(false)}
            onError={() => {
              setVideoError(true)
              setIsLoading(false)
              console.error("Video failed to load:", source.url)
            }}
          />
        </div>
      ) : isYouTube || isDoodStream ? (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            ref={playerRef}
            src={embedUrl}
            title={contentId}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            onLoad={() => {
              if (savedProgress && savedProgress > 0) {
                setTimeout(() => {
                  if (playerRef.current && playerRef.current.contentWindow) {
                    playerRef.current.contentWindow.postMessage(`{"event":"seekTo","data":${savedProgress}}`, "*")
                  }
                }, 1000)
              }
            }}
          />
        </div>
      ) : (
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            ref={playerRef}
            src={embedUrl}
            title={contentId}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}

      {duration > 0 && (
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 transition-all" style={{ width: `${(currentTime / duration) * 100}%` }} />
          </div>
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
      )}
    </div>
  )
}

function resolveEmbedUrl(source: { type: string; url: string }): string {
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
        return `https://www.youtube.com/embed/${videoIdMatch[1]}?enablejsapi=1`
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
    case "direct":
    default:
      return source.url
  }
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }
  return `${m}:${s.toString().padStart(2, "0")}`
}