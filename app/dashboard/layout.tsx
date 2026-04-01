import Script from 'next/script';
import { headers } from 'next/headers';

// Force dynamic rendering so middleware can set headers
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Reading headers forces dynamic rendering on Vercel
  const headersList = await headers();
  const host = headersList.get('host') || '';

  return (
    <>
      <Script
        src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
        strategy="beforeInteractive"
        data-api-key="7523a3b92a09addee08857ff2f4e55f7"
      />
      {children}
    </>
  );
}
