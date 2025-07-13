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
    ], // Allow image URLs from http://localhost and https://samuel-loga-portfolio.vercel.app
  },
}

export default nextConfig
