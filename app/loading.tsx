export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <div className="h-16 border-b border-zinc-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="h-8 w-20 bg-zinc-800 rounded animate-pulse" />
          <div className="flex-1 max-w-xl mx-8">
            <div className="h-10 bg-zinc-800 rounded-full animate-pulse" />
          </div>
          <div className="flex gap-4">
            <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="h-10 bg-zinc-800 rounded w-48 animate-pulse mb-4" />
        <div className="h-4 bg-zinc-800 rounded w-64 animate-pulse mb-10" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[2/3] w-full bg-zinc-800 rounded-lg animate-pulse" />
              <div className="h-4 bg-zinc-800 rounded w-full animate-pulse" />
              <div className="h-3 bg-zinc-800 rounded w-2/3 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}