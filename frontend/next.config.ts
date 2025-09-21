import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "gabiclub.ru" },
      { protocol: "https", hostname: "admin.gabiclub.ru" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "localhost" }
    ],
  },
  eslint: { ignoreDuringBuilds: true },

  /** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true, // ✅ отключает падение сборки от ESLint
    },
};

export default nextConfig;
