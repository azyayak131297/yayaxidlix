"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/Header"
import Link from "next/link"

type DoodStreamReport = {
  reported_on: string
  views: string
  earnings: string
  download: string
  protected_download: string
  protected_embed: string
}

type DoodStreamAccount = {
  email: string
  balance: string
  storage_used: string
  storage_left: string
  premim_expire?: string
}

export default function DoodStreamEarningsPage() {
  const [account, setAccount] = useState<DoodStreamAccount | null>(null)
  const [reports, setReports] = useState<DoodStreamReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/doodstream/earnings")
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch earnings")
        }

        setAccount(data.account)
        setReports(data.reports || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value
    if (isNaN(num)) return "$0.00"
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num)
  }

  const formatBytes = (bytes: string | number) => {
    const num = typeof bytes === "string" ? parseInt(bytes, 10) : bytes
    if (isNaN(num)) return "0 B"
    const units = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(num) / Math.log(1024))
    return `${(num / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
  }

  const totalEarnings = reports.reduce((sum, report) => sum + parseFloat(report.earnings || "0"), 0)
  const totalViews = reports.reduce((sum, report) => sum + parseInt(report.views || "0", 10), 0)

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">DoodStream Earnings</h1>
            <p className="text-zinc-400 mt-1">Monitor your DoodStream account performance and earnings.</p>
          </div>
          <Link href="/admin/videos" className="rounded border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-400 transition-colors">
            ← Kembali ke Videos
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 p-4">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-zinc-400">Loading...</div>
        ) : (
          <>
            {account && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-xs text-zinc-400 mb-1">Balance</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(account.balance)}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-xs text-zinc-400 mb-1">Total Earnings (7 days)</p>
                  <p className="text-2xl font-bold text-yellow-400">{formatCurrency(totalEarnings)}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-xs text-zinc-400 mb-1">Total Views (7 days)</p>
                  <p className="text-2xl font-bold text-blue-400">{totalViews.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-xs text-zinc-400 mb-1">Storage Used</p>
                  <p className="text-2xl font-bold text-zinc-200">{formatBytes(account.storage_used)}</p>
                  <p className="text-xs text-zinc-500 mt-1">of {formatBytes(account.storage_left)} left</p>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 mb-8">
              <h2 className="text-lg font-semibold mb-4">Account Info</h2>
              {account ? (
                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-zinc-400">Email: </span>
                    <span className="text-white">{account.email}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Balance: </span>
                    <span className="text-green-400">{formatCurrency(account.balance)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Storage Used: </span>
                    <span className="text-white">{formatBytes(account.storage_used)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Storage Left: </span>
                    <span className="text-white">{formatBytes(account.storage_left)}</span>
                  </div>
                  {account.premim_expire && (
                    <div>
                      <span className="text-zinc-400">Premium Expires: </span>
                      <span className="text-white">{new Date(account.premim_expire).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-400">No account data available.</p>
              )}
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <h2 className="text-lg font-semibold mb-4">Recent Reports (Last 7 Days)</h2>
              {reports.length === 0 ? (
                <p className="text-sm text-zinc-400">No reports available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-700">
                        <th className="text-left py-2 px-3 text-zinc-400 font-medium">Date</th>
                        <th className="text-right py-2 px-3 text-zinc-400 font-medium">Views</th>
                        <th className="text-right py-2 px-3 text-zinc-400 font-medium">Earnings</th>
                        <th className="text-right py-2 px-3 text-zinc-400 font-medium">Downloads</th>
                        <th className="text-right py-2 px-3 text-zinc-400 font-medium">Embed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report, index) => (
                        <tr key={index} className="border-b border-zinc-800 last:border-0">
                          <td className="py-2 px-3 text-zinc-300">{new Date(report.reported_on).toLocaleDateString()}</td>
                          <td className="py-2 px-3 text-right text-zinc-300">{parseInt(report.views || "0", 10).toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-green-400">{formatCurrency(report.earnings)}</td>
                          <td className="py-2 px-3 text-right text-zinc-300">{parseInt(report.download || "0", 10).toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-zinc-300">{parseInt(report.protected_embed || "0", 10).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
