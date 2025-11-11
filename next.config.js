/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['en', 'hi'],
    defaultLocale: 'en',
  },
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
