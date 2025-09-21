import type { NextConfig } from "next";

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
