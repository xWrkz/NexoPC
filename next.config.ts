// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  experimental: {
    // Optimiza la compilación para desarrollo
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
