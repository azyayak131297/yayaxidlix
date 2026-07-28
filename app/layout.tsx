import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { SiteSettingsProvider } from "@/components/SiteSettingsProvider";
import { loadSiteSettings } from "@/lib/site-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const settings = loadSiteSettings()

export const metadata: Metadata = {
  title: {
    default: settings.site.title,
    template: "%s | " + settings.site.title,
  },
  description: settings.site.description,
  themeColor: settings.site.accentColor,
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = loadSiteSettings()

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ ["--accent" as any]: settings.site.accentColor, ["--accent-hover" as any]: settings.site.accentColor }}
    >
      <body className="min-h-full flex flex-col">
        <SiteSettingsProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SiteSettingsProvider>
        <Footer />
      </body>
    </html>
  );
}
