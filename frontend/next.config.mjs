/** @type {import('next').NextConfig} */
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const noIndex = process.env.NEXT_PUBLIC_SITE_NOINDEX === "1" || process.env.SITE_NOINDEX === "1";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Produce a standalone build so we can deploy the compiled server on Reg.ru
  output: "standalone",
  outputFileTracingRoot: rootDir,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'gabiclub.ru' },
      { protocol: 'https', hostname: 'www.gabiclub.ru' },
      { protocol: 'https', hostname: 'api.gabiclub.ru' },
      { protocol: 'https', hostname: 'admin.gabiclub.ru' },
      // Allow dev media from local Django
      { protocol: 'http', hostname: 'localhost', port: '8000' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8000' },
    ],
  },
  async headers() {
    if (!noIndex) {
      return [];
    }

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
