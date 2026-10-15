/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/beranda',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/home',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
