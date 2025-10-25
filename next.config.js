/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@intelligent-forms/database', '@intelligent-forms/types'],
  images: {
    domains: ['localhost'],
  },
  env: {
    TZ: 'Africa/Kigali',
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // These pages use client-side routing (useSearchParams) and cannot be statically generated
  // They will work correctly at runtime with dynamic rendering
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
