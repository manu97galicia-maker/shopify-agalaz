import { headers } from 'next/headers';

// Force dynamic rendering so middleware can set headers
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const host = headersList.get('host') || '';

  return (
    <>
      <script
        src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
        data-api-key="7523a3b92a09addee08857ff2f4e55f7"
      />
      {children}
    </>
  );
}
