import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Ignora erros de tipo apenas na hora do build da Vercel
    ignoreBuildErrors: true,
  },
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
