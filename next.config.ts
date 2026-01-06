import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Server Actions config
  experimental: {
    serverActions: {
      bodySizeLimit: '64mb',
    },
  },
  
  // Image optimization config
  images: {
    // Allow images from any HTTPS source (Supabase, external CDNs, etc.)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 1 year
    minimumCacheTTL: 31536000,
  },
  
  // Enable compression
  compress: true,
  
  // Optimize for production
  poweredByHeader: false,
};

export default nextConfig;
