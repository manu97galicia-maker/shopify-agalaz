export const metadata = {
  title: 'Privacy Policy — Agalaz Virtual Try-On',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-2xl mx-auto prose prose-slate prose-sm">
        <h1 className="text-2xl font-black text-slate-900">Privacy Policy</h1>
        <p className="text-slate-400 text-xs">Last updated: April 17, 2026</p>

        <h2>1. Introduction</h2>
        <p>
          Agalaz Virtual Try-On (&quot;we&quot;, &quot;our&quot;, &quot;the App&quot;) is a Shopify application that
          provides AI-powered virtual try-on and smart product recommendations for online stores.
          This policy explains how we handle data when merchants install our app and when their
          customers use the virtual try-on feature.
        </p>

        <h2>2. Data We Collect</h2>

        <h3>From Merchants (Store Owners)</h3>
        <ul>
          <li><strong>Shop domain and store name</strong> — to identify your store and manage your account.</li>
          <li><strong>Email address</strong> — for account communication and billing.</li>
          <li><strong>Shopify access token</strong> — to integrate with your store. Stored server-side only,
            never exposed to the browser or logged.</li>
          <li><strong>Product catalog data</strong> — product titles, descriptions, types, tags, prices,
            and featured images are synced from your Shopify store to provide smart cross-sell
            recommendations. This data is stored in our database and kept in sync via Shopify webhooks.</li>
          <li><strong>Usage data</strong> — number of try-on renders and API calls, for billing and
            abuse prevention.</li>
        </ul>

        <h3>From Customers (Shoppers)</h3>
        <ul>
          <li><strong>Uploaded photos</strong> — processed in real-time to generate the virtual try-on result.
            <strong> Photos are NOT stored on our servers.</strong> They are sent to the AI model,
            processed in memory, and discarded immediately after the result is generated.
            We do not save, cache, or log customer photos at any point.</li>
          <li><strong>No personal information</strong> — we do not collect names, emails, addresses,
            IP addresses, or any other personally identifiable information from customers.</li>
          <li><strong>No cookies or tracking</strong> — the try-on widget does not set cookies, use
            local storage, or track customer behavior across pages.</li>
        </ul>

        <h2>3. How We Use Data</h2>
        <ul>
          <li><strong>Merchant data</strong> is used solely to provide, manage, and bill for the App service.</li>
          <li><strong>Product catalog data</strong> is used to classify products by category, style, and color
            to generate cross-sell recommendations (e.g., suggesting matching pants after trying on a shirt).
            This classification is done via AI text analysis of product metadata — not product images.</li>
          <li><strong>Customer photos</strong> are used only for real-time AI processing and are never
            saved, stored, shared, or used for any other purpose.</li>
          <li><strong>Usage statistics</strong> are collected in aggregate to track render counts for billing
            and to enforce rate limits.</li>
        </ul>

        <h2>4. Data Sharing</h2>
        <p>We do not sell, rent, or share personal data with third parties. We use the following
          service providers to operate the App:</p>
        <ul>
          <li><strong>Google Gemini API</strong> — customer photos are sent to Google&apos;s Gemini AI
            for virtual try-on image generation. Product metadata (titles, types, tags — not images)
            is sent for classification and recommendation ranking. Google processes this data according
            to their{' '}
            <a href="https://ai.google.dev/terms" target="_blank" rel="noopener noreferrer">API Terms of Service</a>.
            Images sent via the paid API tier are not used to train models. Google may temporarily
            retain images for up to 30 days solely for abuse and safety monitoring, after which they
            are permanently deleted.</li>
          <li><strong>Shopify Billing</strong> — all merchant subscription and one-time charges
            are processed by Shopify under your existing Shopify merchant agreement. Agalaz never sees,
            handles, or stores your payment details.</li>
          <li><strong>Supabase</strong> — our database provider (hosted in the EU), which stores
            merchant account data and product catalog information. No customer data is stored.</li>
          <li><strong>Vercel</strong> — our hosting provider, which processes API requests.
            Vercel does not retain request payloads (including images) beyond the request lifecycle.</li>
        </ul>

        <h2>5. Data Retention</h2>
        <ul>
          <li><strong>Customer photos</strong>: Not retained by Agalaz. Processed in memory and discarded
            immediately after the try-on result is generated. The rendered result image is returned to
            the customer&apos;s browser and not stored on our servers. Google may retain submitted images
            for up to 30 days for safety monitoring only.</li>
          <li><strong>Product catalog data</strong>: Retained while the App is installed and kept in sync
            via webhooks. Deleted when the merchant uninstalls the App.</li>
          <li><strong>Merchant account data</strong>: Retained while the App is installed. Upon uninstallation,
            we deactivate the account and clear sensitive data (Shopify access tokens) within 48 hours.
            Remaining account data (store name, usage history) is deleted within 30 days.</li>
        </ul>

        <h2>6. GDPR &amp; Data Protection Compliance</h2>
        <p>We comply with GDPR, UK GDPR, and Shopify&apos;s mandatory privacy requirements:</p>
        <ul>
          <li><strong>Customer data requests</strong> — since we store no customer personal data,
            there is nothing to export. We confirm this within 30 days of any request.</li>
          <li><strong>Customer data erasure requests</strong> — since we store no customer personal data,
            there is nothing to delete. We confirm this within 30 days of any request.</li>
          <li><strong>Shop data erasure requests</strong> — upon app uninstall or merchant request,
            all merchant data including product catalog, usage history, and API credentials are deleted.</li>
          <li><strong>Data processing basis</strong> — for merchants: contractual necessity (providing the service).
            For customers: legitimate interest of the merchant to offer virtual try-on on their store.
            Customers consent by voluntarily uploading their photo.</li>
          <li><strong>Data location</strong> — our database is hosted in the EU (Supabase). AI processing
            occurs via Google Cloud (US/EU). Hosting is via Vercel (global edge network).</li>
        </ul>

        <h2>7. Security Measures</h2>
        <p>We implement the following security measures to protect data:</p>
        <ul>
          <li><strong>Encryption in transit</strong> — all data is transmitted over HTTPS/TLS.
            No data is ever sent unencrypted.</li>
          <li><strong>API key security</strong> — merchant API keys are hashed with SHA-256 before storage.
            Raw keys are shown once at creation and cannot be retrieved.</li>
          <li><strong>OAuth security</strong> — Shopify OAuth uses cryptographic nonces with HMAC
            verification to prevent CSRF attacks.</li>
          <li><strong>Webhook verification</strong> — all incoming Shopify webhooks are verified via
            HMAC-SHA256 signature before processing.</li>
          <li><strong>CORS restrictions</strong> — API endpoints only accept requests from authorized
            origins (merchant Shopify stores and our own domains).</li>
          <li><strong>SSRF protection</strong> — our image proxy blocks requests to private IP ranges,
            internal networks, and cloud metadata endpoints.</li>
          <li><strong>Rate limiting</strong> — daily attempt caps per merchant prevent abuse and
            limit potential cost from compromised API keys.</li>
          <li><strong>No client-side secrets</strong> — Shopify access tokens, API secrets, and database
            credentials are server-side only and never exposed to browsers.</li>
        </ul>

        <h2>8. Children&apos;s Privacy</h2>
        <p>
          The App is not directed at children under 16. We do not knowingly process photos of children.
          Merchants are responsible for ensuring their customers meet the minimum age requirements
          of their jurisdiction.
        </p>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Material changes will be communicated
          via the App dashboard. Continued use of the App after changes constitutes acceptance.
        </p>

        <h2>10. Contact</h2>
        <p>
          For privacy questions, data requests, or concerns, contact us at:{' '}
          <a href="mailto:infoagalaz@gmail.com">infoagalaz@gmail.com</a>
        </p>
        <p>
          Data Protection Officer: Agalaz Team —{' '}
          <a href="mailto:infoagalaz@gmail.com">infoagalaz@gmail.com</a>
        </p>

        <hr />
        <p className="text-slate-400 text-xs">
          Agalaz Virtual Try-On — <a href="https://agalaz.com" className="text-indigo-500">agalaz.com</a>
        </p>
      </div>
    </div>
  );
}
