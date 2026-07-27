const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = process.env.TMDB_API_KEY

if (!API_KEY) {
  console.warn("TMDB_API_KEY belum diisi di .env")
}

export interface TmdbTrendingItem {
  id: number
  title?: string
  name?: string
  poster_path?: string | null
  release_date?: string
  first_air_date?: string
  media_type: string
}

export interface TmdbMovie {
  id: number
  title: string
  backdrop_path?: string | null
  poster_path?: string | null
  release_date?: string
  overview?: string
  vote_average?: number
  runtime?: number
  genres?: { id: number; name: string }[]
}

export interface TmdbSeries {
  id: number
  name: string
  backdrop_path?: string | null
  poster_path?: string | null
  first_air_date?: string
  overview?: string
  vote_average?: number
  number_of_seasons?: number
  genres?: { id: number; name: string }[]
  seasons?: { id: number; name: string; episode_count: number; season_number: number; poster_path?: string | null }[]
}

export interface TmdbEpisode {
  id: number
  name: string
  overview?: string
  episode_number: number
  season_number: number
  still_path?: string | null
  air_date?: string
}

export interface TmdbSeason {
  id: number
  name: string
  overview?: string
  season_number: number
  episode_count: number
  poster_path?: string | null
  episodes?: TmdbEpisode[]
}

function isValidApiKey(key: string | undefined): boolean {
  if (!key || key.trim().length === 0) return false
  if (key.includes("API_KEY") || key.includes("placeholder") || key.includes("isi_dengan")) return false
  return true
}

export async function fetchTrending(): Promise<TmdbTrendingItem[]> {
  if (!isValidApiKey(API_KEY)) return []
  try {
    const res = await fetch(`${TMDB_BASE_URL}/trending/all/week?api_key=${API_KEY}&language=id-ID&region=ID`, {
      next: { revalidate: 3600 }
    })
    if (!res.ok) {
      return []
    }
    const data = await res.json()
    return data?.results?.filter((item: TmdbTrendingItem) => item.media_type === "movie" || item.media_type === "tv") || []
  } catch {
    return []
  }
}

export async function fetchNowPlayingMovies(): Promise<TmdbMovie[]> {
  if (!isValidApiKey(API_KEY)) return []
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=id-ID&region=ID`, {
      next: { revalidate: 3600 }
    })
    if (!res.ok) {
      return []
    }
    const data = await res.json()
    return data?.results || []
  } catch {
    return []
  }
}

export async function fetchOnTheAirSeries(): Promise<TmdbSeries[]> {
  if (!isValidApiKey(API_KEY)) return []
  try {
    const res = await fetch(`${TMDB_BASE_URL}/tv/on_the_air?api_key=${API_KEY}&language=id-ID&region=ID`, {
      next: { revalidate: 3600 }
    })
    if (!res.ok) {
      return []
    }
    const data = await res.json()
    return data?.results || []
  } catch {
    return []
  }
}

export async function fetchMovieDetails(id: string | number): Promise<TmdbMovie | null> {
  if (!isValidApiKey(API_KEY)) return null
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${API_KEY}&language=id-ID`, {
      next: { revalidate: 3600 }
    })
    if (!res.ok) {
      return null
    }
    return res.json()
  } catch {
    return null
  }
}

export async function fetchSeriesDetails(id: string | number): Promise<TmdbSeries | null> {
  if (!isValidApiKey(API_KEY)) return null
  try {
    const res = await fetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${API_KEY}&language=id-ID`, {
      next: { revalidate: 3600 }
    })
    if (!res.ok) {
      return null
    }
    return res.json()
  } catch {
    return null
  }
}

export async function fetchSeasonDetails(
  seriesId: string | number,
  seasonNumber: number
): Promise<TmdbSeason | null> {
  if (!isValidApiKey(API_KEY)) return null
  try {
    const res = await fetch(`${TMDB_BASE_URL}/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}&language=id-ID`, {
      next: { revalidate: 3600 }
    })
    if (!res.ok) {
      return null
    }
    return res.json()
  } catch {
    return null
  }
}

export async function searchTmdb(query: string): Promise<{
  id: number
  title?: string
  name?: string
  poster_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  first_air_date?: string
  media_type: string
  overview?: string
  vote_average?: number
}[]> {
  if (!isValidApiKey(API_KEY)) return []
  const q = query.trim()
  if (!q) return []

  try {
    const res = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${API_KEY}&language=id-ID&query=${encodeURIComponent(q)}&page=1`, {
      next: { revalidate: 3600 }
    })
    if (!res.ok) {
      return []
    }
    const data = await res.json()
    return data?.results?.filter((item: any) => item.media_type === "movie" || item.media_type === "tv") || []
  } catch {
    return []
  }
}

export interface TmdbGenre {
  id: number
  name: string
}

export async function fetchGenres(): Promise<TmdbGenre[]> {
  if (!isValidApiKey(API_KEY)) return []
  try {
    const [moviesRes, seriesRes] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=id-ID`, {
        next: { revalidate: 3600 }
      }),
      fetch(`${TMDB_BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=id-ID`, {
        next: { revalidate: 3600 }
      })
    ])

    const movieGenres = moviesRes.ok ? await moviesRes.json() : { genres: [] }
    const seriesGenres = seriesRes.ok ? await seriesRes.json() : { genres: [] }

    const genreMap = new Map<number, string>()
    for (const g of movieGenres.genres || []) {
      genreMap.set(g.id, g.name)
    }
    for (const g of seriesGenres.genres || []) {
      if (!genreMap.has(g.id)) {
        genreMap.set(g.id, g.name)
      }
    }

    return Array.from(genreMap.entries()).map(([id, name]) => ({ id, name }))
  } catch {
    return []
  }
}

export async function fetchMoviesByGenre(genreId: number, page = 1): Promise<any[]> {
  if (!isValidApiKey(API_KEY)) return []
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&language=id-ID&with_genres=${genreId}&page=${page}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data?.results || []
  } catch {
    return []
  }
}

export async function fetchSeriesByGenre(genreId: number, page = 1): Promise<any[]> {
  if (!isValidApiKey(API_KEY)) return []
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${API_KEY}&language=id-ID&with_genres=${genreId}&page=${page}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data?.results || []
  } catch {
    return []
  }
}

export interface TmdbCountry {
  iso_3166_1: string
  english_name: string
  native_name?: string
}

export async function fetchCountries(): Promise<TmdbCountry[]> {
  if (!isValidApiKey(API_KEY)) return []
  try {
    const res = await fetch(`${TMDB_BASE_URL}/watch/providers/regions?api_key=${API_KEY}`, {
      next: { revalidate: 86400 }
    })
    if (!res.ok) {
      return []
    }
    const data = await res.json()
    return data?.results || []
  } catch {
    return []
  }
}

export async function fetchMoviesByCountry(countryCode: string, page = 1): Promise<any[]> {
  if (!isValidApiKey(API_KEY)) return []
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&language=id-ID&with_origin_country=${countryCode}&page=${page}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data?.results || []
  } catch {
    return []
  }
}

export async function fetchSeriesByCountry(countryCode: string, page = 1): Promise<any[]> {
  if (!isValidApiKey(API_KEY)) return []
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${API_KEY}&language=id-ID&with_origin_country=${countryCode}&page=${page}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data?.results || []
  } catch {
    return []
  }
}

export async function fetchMoviesByYear(year: number, page = 1): Promise<any[]> {
  if (!isValidApiKey(API_KEY)) return []
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&language=id-ID&primary_release_year=${year}&page=${page}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data?.results || []
  } catch {
    return []
  }
}

export async function fetchSeriesByYear(year: number, page = 1): Promise<any[]> {
  if (!isValidApiKey(API_KEY)) return []
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${API_KEY}&language=id-ID&first_air_date_year=${year}&page=${page}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data?.results || []
  } catch {
    return []
  }
}

export interface TmdbNetwork {
  id: number
  name: string
  logo_path?: string | null
  origin_country?: string
}

const POPULAR_NETWORKS: TmdbNetwork[] = [
  { id: 213, name: "Netflix" },
  { id: 453, name: "Disney+" },
  { id: 174, name: "HBO Max" },
  { id: 273, name: "Amazon Prime" },
  { id: 33, name: "BBC" },
  { id: 40, name: "Hulu" },
  { id: 159, name: "Apple TV+" },
  { id: 1024, name: "Paramount+" },
  { id: 865, name: "Peacock" },
  { id: 263, name: "Crunchyroll" },
]

export async function fetchNetworks(): Promise<TmdbNetwork[]> {
  if (!isValidApiKey(API_KEY)) return POPULAR_NETWORKS
  try {
    const res = await fetch(`${TMDB_BASE_URL}/network?api_key=${API_KEY}`, {
      next: { revalidate: 86400 }
    })
    if (!res.ok) return POPULAR_NETWORKS
    const data = await res.json()
    return data?.networks || POPULAR_NETWORKS
  } catch {
    return POPULAR_NETWORKS
  }
}

export async function fetchMoviesByNetwork(networkId: number, page = 1): Promise<any[]> {
  if (!isValidApiKey(API_KEY)) return []
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&language=id-ID&with_networks=${networkId}&page=${page}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data?.results || []
  } catch {
    return []
  }
}

export async function fetchSeriesByNetwork(networkId: number, page = 1): Promise<any[]> {
  if (!isValidApiKey(API_KEY)) return []
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${API_KEY}&language=id-ID&with_networks=${networkId}&page=${page}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data?.results || []
  } catch {
    return []
  }
}

function getUniqueYears(movies: any[], series: any[]): number[] {
  const years = new Set<number>()
  for (const item of movies) {
    const year = item.release_date?.slice(0, 4)
    if (year) years.add(Number(year))
  }
  for (const item of series) {
    const year = item.first_air_date?.slice(0, 4)
    if (year) years.add(Number(year))
  }
  return Array.from(years).sort((a, b) => b - a)
}

export async function fetchYears(): Promise<number[]> {
  if (!isValidApiKey(API_KEY)) return []
  try {
    const [moviesRes, seriesRes] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&language=id-ID&sort_by=primary_release_date.desc&page=1`, {
        next: { revalidate: 86400 }
      }),
      fetch(`${TMDB_BASE_URL}/discover/tv?api_key=${API_KEY}&language=id-ID&sort_by=first_air_date.desc&page=1`, {
        next: { revalidate: 86400 }
      })
    ])
    const movies = moviesRes.ok ? await moviesRes.json() : { results: [] }
    const series = seriesRes.ok ? await seriesRes.json() : { results: [] }
    return getUniqueYears(movies.results || [], series.results || [])
  } catch {
    return []
  }
}

export function getImageUrl(path: string, size = "w500") {
  if (!path) return ""
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export function getYear(dateString?: string) {
  if (!dateString) return ""
  return new Date(dateString).getFullYear()
}
