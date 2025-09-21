import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'samuel-loga-portfolio.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'www.shutterstock.com',
      },
      {
        protocol: 'https',
        hostname: 'tredugabdlyjhvxlpccy.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/blog-images/**',
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
