/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: i18n is handled via middleware in App Router, not via next.config.js
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    esmExternals: 'loose',
  },
  transpilePackages: ['pdfjs-dist', 'react-pdf'],
  images: {
    domains: ['res.cloudinary.com', 'localhost'],
  },
};

module.exports = nextConfig;
