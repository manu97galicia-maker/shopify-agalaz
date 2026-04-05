export const metadata = {
  title: 'Privacy Policy — Agalaz Virtual Try-On',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-2xl mx-auto prose prose-slate prose-sm">
        <h1 className="text-2xl font-black text-slate-900">Privacy Policy</h1>
        <p className="text-slate-400 text-xs">Last updated: March 28, 2026</p>

        <h2>1. Introduction</h2>
        <p>
          Agalaz Virtual Try-On (&quot;we&quot;, &quot;our&quot;, &quot;the App&quot;) is a Shopify application that
          provides AI-powered virtual clothing try-on for online stores. This policy explains how we
          handle data when merchants install our app and when their customers use the virtual try-on feature.
        </p>

        <h2>2. Data We Collect</h2>

        <h3>From Merchants (Store Owners)</h3>
        <ul>
          <li><strong>Shop domain and store name</strong> — to identify your store and manage your account.</li>
          <li><strong>Email address</strong> — for account communication and billing.</li>
          <li><strong>Shopify access token</strong> — to integrate with your store (encrypted, server-side only).</li>
          <li><strong>Usage data</strong> — number of try-on renders used, for billing purposes.</li>
        </ul>

        <h3>From Customers (Shoppers)</h3>
        <ul>
          <li><strong>Uploaded photos</strong> — processed in real-time to generate the virtual try-on result.
            <strong> Photos are NOT stored.</strong> They are sent to the AI model, processed in memory,
            and discarded immediately after the result is generated.</li>
          <li><strong>No personal information</strong> — we do not collect names, emails, addresses,
            or any other personal data from customers.</li>
        </ul>

        <h2>3. How We Use Data</h2>
        <ul>
          <li>Merchant data is used solely to provide and manage the App service.</li>
          <li>Customer photos are used only for real-time AI processing and are never saved, stored, or shared.</li>
          <li>Usage statistics are collected in aggregate to track render counts for billing.</li>
        </ul>

        <h2>4. Data Sharing</h2>
        <p>We do not sell, rent, or share personal data with third parties, except:</p>
        <ul>
          <li><strong>Google Gemini API</strong> — customer photos are sent to Google&apos;s Gemini AI for processing.
            Google processes these images according to their{' '}
            <a href="https://ai.google.dev/terms" target="_blank" rel="noopener noreferrer">API Terms of Service</a>.
            Images sent via the API are not used to train models.</li>
          <li><strong>Stripe</strong> — for merchant subscription billing. Stripe processes payment data
            per their own privacy policy.</li>
          <li><strong>Supabase</strong> — our database provider, which stores merchant account data.</li>
        </ul>

        <h2>5. Data Retention</h2>
        <ul>
          <li><strong>Customer photos</strong>: Not retained. Processed in memory and discarded immediately.</li>
          <li><strong>Merchant data</strong>: Retained while the App is installed. Upon uninstallation,
            we deactivate the account and clear sensitive data (access tokens) within 48 hours.</li>
        </ul>

        <h2>6. GDPR Compliance</h2>
        <p>We comply with GDPR and Shopify&apos;s mandatory privacy requirements:</p>
        <ul>
          <li>We respond to <strong>customer data requests</strong> — since we store no customer data,
            there is nothing to export.</li>
          <li>We respond to <strong>customer data erasure requests</strong> — since we store no customer data,
            there is nothing to delete.</li>
          <li>We respond to <strong>shop data erasure requests</strong> — upon app uninstall,
            merchant data is deactivated and sensitive tokens are deleted.</li>
        </ul>

        <h2>7. Security</h2>
        <p>
          We use industry-standard security measures including HTTPS encryption, secure token storage,
          HMAC signature verification for all webhooks, and server-side-only processing of sensitive data.
        </p>

        <h2>8. Contact</h2>
        <p>
          For privacy questions or data requests, contact us at:{' '}
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
