import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agalaz Virtual Try-On — Shopify App',
  description: 'AI-powered virtual try-on for your Shopify store. Customers try on clothing, glasses, jewelry & accessories before buying.',
};

const APP_BRIDGE_API_KEY = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || '';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {APP_BRIDGE_API_KEY && (
          <script
            src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
            data-api-key={APP_BRIDGE_API_KEY}
          />
        )}
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
