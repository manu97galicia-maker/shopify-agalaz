/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors https://*.myshopify.com https://admin.shopify.com https://*.shopify.com *;',
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.myshopify.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
    ],
  },
};

module.exports = nextConfig;
