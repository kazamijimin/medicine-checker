/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "ivwxjvyicxqmuzkybssa.supabase.co",
      "ui-avatars.com"
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig