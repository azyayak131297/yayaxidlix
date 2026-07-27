"use client"

import { useEffect } from "react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
          <p className="text-zinc-400 mb-6 text-sm">
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={reset}
            className="rounded bg-red-600 px-6 py-3 text-sm font-bold hover:bg-red-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}