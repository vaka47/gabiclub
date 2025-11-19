/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
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
};
export default nextConfig;
