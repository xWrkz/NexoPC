// next.config.ts
import type { NextConfig } from 'next';

const wordpressUrl = process.env.WORDPRESS_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
const wordpressHost = wordpressUrl ? new URL(wordpressUrl) : null;

const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "wordpress.wrkz.net", pathname: "/wp-content/**" },
      ...(wordpressHost
        ? [{
            protocol: wordpressHost.protocol.replace(":", "") as "http" | "https",
            hostname: wordpressHost.hostname,
            port: wordpressHost.port,
            pathname: "/wp-content/**",
          }]
        : []),
    ],
  },
  experimental: {
    // Optimiza la compilación para desarrollo
    turbopackFileSystemCacheForDev: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
