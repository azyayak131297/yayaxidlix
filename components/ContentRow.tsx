import { ContentCard } from "@/components/ContentCard"

type ContentRowProps = {
  title: string
  items: Array<{
    id: number
    title?: string
    name?: string
    poster_path?: string | null
    release_date?: string
    first_air_date?: string
    media_type?: string
  }>
  mediaType: "movie" | "tv"
}

export function ContentRow({ title, items, mediaType }: ContentRowProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => (
          <ContentCard
            key={`${item.media_type || mediaType}-${item.id}`}
            id={item.id}
            title={item.title}
            name={item.name}
            posterPath={item.poster_path}
            releaseDate={item.release_date}
            firstAirDate={item.first_air_date}
            mediaType={(item.media_type as "movie" | "tv") || mediaType}
          />
        ))}
      </div>
    </section>
  )
}
