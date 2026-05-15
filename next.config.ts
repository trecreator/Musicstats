import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ytimg.com', // Libera qualquer subdomínio do servidor de imagens do YouTube
      },
      {
        protocol: 'https',
        hostname: '**.youtube.com',
      }
    ],
  },
};

export default nextConfig;
