/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure API routes are not evaluated during build
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
