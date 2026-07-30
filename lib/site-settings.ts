import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

export interface SiteSettings {
  formatVersion: string
  site: {
    title: string
    description: string
    accentColor: string
    logoText: string
  }
  features: {
    showLocal: boolean
    showTrailer: boolean
    showCast: boolean
  }
  backgrounds: {
    homeGenre: string
    homeCountry: string
    homeYear: string
    homeNetwork: string
  }
}

let cachedSettings: SiteSettings = {
  formatVersion: "1.0",
  site: {
    title: "IDLIX",
    description: "Platform streaming pribadi",
    accentColor: "#dc2626",
    logoText: "IDLIX",
  },
  features: {
    showLocal: true,
    showTrailer: true,
    showCast: true,
  },
  backgrounds: {
    homeGenre: "https://picsum.photos/seed/genre-bg/600/400",
    homeCountry: "https://picsum.photos/seed/country-bg/600/400",
    homeYear: "https://picsum.photos/seed/year-bg/600/400",
    homeNetwork: "https://picsum.photos/seed/network-bg/600/400",
  },
}

function getSettingsPath() {
  return join(process.cwd(), "data", "site-settings.json")
}

export function loadSiteSettings(): SiteSettings {
  try {
    const content = readFileSync(getSettingsPath(), "utf-8")
    cachedSettings = JSON.parse(content)
    return cachedSettings
  } catch {
    return cachedSettings
  }
}

export function saveSiteSettings(settings: SiteSettings) {
  try {
    writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), "utf-8")
    cachedSettings = settings
    return true
  } catch {
    return false
  }
}