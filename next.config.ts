import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Cloudflare Pages compatibility
  trailingSlash: true,

  images: {
    // Enable image optimization for Supabase storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xvwaasarrkyxczhwwiqs.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Image formats in order of preference
    formats: ["image/webp", "image/avif"],
    // Enable placeholder blur for better UX
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Image sizes for responsive loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    // Cache optimization
    minimumCacheTTL: 86400, // 24 hours
  },

  // Enable compression
  compress: true,

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ["lucide-react"],
    devtoolSegmentExplorer: true,
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; img-src 'self' data: https: blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.clarity.ms https://scripts.clarity.ms; style-src 'self' 'unsafe-inline'; connect-src 'self' https://xvwaasarrkyxczhwwiqs.supabase.co https://www.clarity.ms https://k.clarity.ms;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
