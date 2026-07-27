import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "IDLIX — Hybrid Streaming Platform",
    template: "%s | IDLIX",
  },
  description:
    "Hybrid streaming platform combining TMDB data with custom content support. Browse movies, TV series, and filter by genre, country, year, and network.",
  keywords: [
    "streaming",
    "movies",
    "TV series",
    "TMDB",
    "custom content",
    "watch online",
  ],
  authors: [{ name: "IDLIX" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#000000",
  openGraph: {
    title: "IDLIX — Hybrid Streaming Platform",
    description:
      "Browse and watch movies and TV series on IDLIX. Hybrid streaming with TMDB data and custom content support.",
    type: "website",
    siteName: "IDLIX",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}
