import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

export interface NetworkBackdrop {
  network: string
  backdropUrl: string
  color: string
}

export interface NetworkBackdropsData {
  formatVersion: string
  backdrops: Record<string, NetworkBackdrop>
  defaults: {
    fallbackBackdrop: string
    fallbackColor: string
  }
}

let cachedData: NetworkBackdropsData | null = null

function getNetworkBackdropsPath() {
  return join(process.cwd(), "data", "network-backdrops.json")
}

export function loadNetworkBackdrops(): NetworkBackdropsData {
  if (cachedData) return cachedData

  try {
    const content = readFileSync(getNetworkBackdropsPath(), "utf-8")
    cachedData = JSON.parse(content) as NetworkBackdropsData
    return cachedData
  } catch {
    return {
      formatVersion: "1.0",
      backdrops: {},
      defaults: {
        fallbackBackdrop: "",
        fallbackColor: "#1a1a2e",
      },
    }
  }
}

export function getNetworkBackdrop(networkId: string | number): NetworkBackdrop | null {
  const data = loadNetworkBackdrops()
  const idStr = String(networkId)
  return data.backdrops[idStr] || null
}

export function getAllNetworkBackdrops(): Record<string, NetworkBackdrop> {
  const data = loadNetworkBackdrops()
  return data.backdrops
}

export function upsertNetworkBackdrop(networkId: string | number, backdrop: NetworkBackdrop): NetworkBackdrop {
  const data = loadNetworkBackdrops()
  data.backdrops[String(networkId)] = backdrop
  const path = getNetworkBackdropsPath()
  writeFileSync(path, JSON.stringify(data, null, 2), "utf-8")
  cachedData = data
  return backdrop
}