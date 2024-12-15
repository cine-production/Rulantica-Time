/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  // Ajout des rewrites pour le serveur proxy
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Ton URL interne de l'application
        destination: 'https://queue-times.com/:path*', // L'URL externe que tu veux atteindre via le proxy
      },
    ];
  },
}

module.exports = nextConfig;
