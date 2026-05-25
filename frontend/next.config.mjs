/** @type {import('next').NextConfig} */
const noIndex = process.env.NEXT_PUBLIC_SITE_NOINDEX === "1" || process.env.SITE_NOINDEX === "1";

const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Produce a standalone build so we can deploy the compiled server on Reg.ru
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
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
