/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Shopify to embed the app in an iframe
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: 'frame-ancestors https://*.myshopify.com https://admin.shopify.com',
          },
          { key: 'X-Frame-Options', value: '' },
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
