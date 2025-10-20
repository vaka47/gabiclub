// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: {
    // Подставь свои хосты, это безопасный дефолт:
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
