// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['appliance-rental-images.s3.us-east-1.amazonaws.com', 'rashid-rentease-images.s3.ap-southeast-2.amazonaws.com'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig