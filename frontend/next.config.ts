import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export",
    eslint: {
        ignoreDuringBuilds: true, // ✅ отключает падение сборки от ESLint
    },
};

export default nextConfig;
