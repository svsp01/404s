/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true 
  },
  // In Next.js 15, serverActions is enabled by default
  // If you need to configure it, use an object:
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.netlify.app']
    }
  }
};

module.exports = nextConfig;