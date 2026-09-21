// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Optimiza la compilación para desarrollo
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;