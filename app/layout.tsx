import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agalaz Virtual Try-On — Shopify App',
  description: 'AI-powered virtual try-on for your Shopify store. Customers try on clothing, glasses, jewelry & accessories before buying.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
