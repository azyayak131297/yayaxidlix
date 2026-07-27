import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: isDev
      ? undefined
      : [
          { protocol: "https", hostname: "image.tmdb.org" },
          { protocol: "https", hostname: "archive.org" },
          { protocol: "https", hostname: "i.ytimg.com" },
          { protocol: "https", hostname: "yt3.ggpht.com" },
        ],
    unoptimized: isDev,
  },
};

export default nextConfig;
