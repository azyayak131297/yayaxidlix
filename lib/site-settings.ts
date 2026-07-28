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
    showTmdb: boolean
    showLocal: boolean
    showTrailer: boolean
    showCast: boolean
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
    showTmdb: true,
    showLocal: true,
    showTrailer: true,
    showCast: true,
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