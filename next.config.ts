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
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
    // Higher starting values to prevent low-resolution fetches on mobile
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
    imageSizes: [256, 384, 512],
    qualities: [75, 80, 85, 90, 95],
    // Cache optimized images for 1 year
    minimumCacheTTL: 31536000,
  },

  // Enable compression
  compress: true,

  // Optimize for production
  poweredByHeader: false,
};

export default nextConfig;
