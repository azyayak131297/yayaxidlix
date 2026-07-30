"use client"

import { createContext, useContext, useEffect, useState } from "react"

type SiteSettings = {
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

type SiteSettingsContextValue = {
  settings: SiteSettings
  loading: boolean
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: {
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
  },
  loading: true,
})

export function SiteSettingsProvider({ children, initialSettings }: { children: React.ReactNode; initialSettings?: SiteSettings }) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings || {
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
  })
  const [loading, setLoading] = useState(!initialSettings)

  useEffect(() => {
    if (initialSettings) return
    let mounted = true
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((json) => {
        if (mounted && json.data) {
          setSettings(json.data)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [initialSettings])

  return (
    <SiteSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}