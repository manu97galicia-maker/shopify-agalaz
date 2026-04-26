export const metadata = {
  title: 'Data Processing Agreement — Agalaz Virtual Try-On',
  robots: 'noindex, nofollow',
};

export default function DPAPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-4 print:py-4">
      <style>{`
        @media print {
          @page { margin: 2cm; }
          body { font-size: 10pt; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="max-w-3xl mx-auto prose prose-slate prose-sm">
        <div className="no-print mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-xs">
          <p className="m-0 text-indigo-900">
            <strong>Save as PDF:</strong> press <kbd className="px-1.5 py-0.5 bg-white border border-indigo-200 rounded">Ctrl/Cmd + P</kbd> → Destination: <em>Save as PDF</em>.
          </p>
        </div>

        <h1 className="text-2xl font-black text-slate-900">Data Processing Agreement (DPA)</h1>
        <p className="text-slate-400 text-xs">Version 1.0 — Effective: April 17, 2026</p>

        <p>
          This Data Processing Agreement (&quot;DPA&quot;) forms part of the Terms of Service between
          Agalaz (&quot;Processor&quot;) and the Shopify merchant who installs the Agalaz Virtual Try-On
          application (&quot;Controller&quot;). It is entered into automatically upon installation of the
          App and governs the processing of personal data by the Processor on behalf of the Controller
          under Regulation (EU) 2016/679 (&quot;GDPR&quot;), the UK Data Protection Act 2018, and
          equivalent data protection laws.
        </p>

        <h2>1. Definitions</h2>
        <ul>
          <li><strong>Controller</strong>: the Shopify merchant that installs and uses the App, and who
            determines the purposes and means of processing Personal Data of its customers.</li>
          <li><strong>Processor</strong>: Agalaz, which processes Personal Data on behalf of the Controller
            in accordance with this DPA.</li>
          <li><strong>Personal Data</strong>: any information relating to an identified or identifiable
            natural person, as defined in Art. 4(1) GDPR.</li>
          <li><strong>Data Subject</strong>: the Controller&apos;s end customer who uses the virtual try-on
            feature on the Controller&apos;s Shopify store.</li>
          <li><strong>Sub-processor</strong>: any third party engaged by the Processor to process Personal
            Data on behalf of the Controller.</li>
        </ul>

        <h2>2. Subject matter and duration</h2>
        <p>
          The Processor processes Personal Data for the sole purpose of providing the App&apos;s functionality
          (AI virtual try-on generation and smart cross-sell recommendations) to the Controller. Processing
          is performed for the duration of the App installation and ceases automatically upon uninstallation.
        </p>

        <h2>3. Nature and purpose of processing</h2>
        <ul>
          <li>Receiving customer-uploaded photos via the try-on widget, transmitting them to the AI model
            for real-time processing, and returning the generated result to the customer&apos;s browser.</li>
          <li>Reading the Controller&apos;s product catalog via Shopify Admin API to enable AI classification
            and cross-sell recommendation.</li>
          <li>Storing aggregated usage data (render counts, timestamps) for billing and abuse prevention.</li>
        </ul>

        <h2>4. Types of Personal Data processed</h2>
        <ul>
          <li><strong>Customer photos</strong> — processed in memory only. NOT stored on Processor servers.
            Sent to the AI sub-processor (Google Gemini) for result generation and immediately discarded.</li>
          <li><strong>Merchant account data</strong> — email, shop domain, store name, Shopify access token
            (encrypted). Billing data is processed by Shopify under your Shopify merchant agreement; the
            Processor does not store payment details.</li>
          <li><strong>Product catalog metadata</strong> — product titles, descriptions, types, tags, images
            URLs, variant info (not customer data).</li>
        </ul>

        <h2>5. Categories of Data Subjects</h2>
        <ul>
          <li>End customers of the Controller who voluntarily use the virtual try-on feature.</li>
          <li>Controller staff members with access to the merchant dashboard.</li>
        </ul>

        <h2>6. Controller obligations</h2>
        <p>The Controller represents and warrants that:</p>
        <ul>
          <li>It has a lawful basis under GDPR Art. 6 (and, where applicable, Art. 9) to collect photos from
            Data Subjects and to transmit them to the Processor via the App widget.</li>
          <li>It informs Data Subjects clearly and obtains consent where required before they submit photos.</li>
          <li>It has a valid privacy policy covering the use of the App and the involvement of the Processor
            and its Sub-processors.</li>
        </ul>

        <h2>7. Processor obligations</h2>
        <p>The Processor shall:</p>
        <ul>
          <li>Process Personal Data only on documented instructions from the Controller, including as set out
            in this DPA, the Privacy Policy, and the Terms of Service.</li>
          <li>Ensure that all personnel authorised to process Personal Data are bound by confidentiality.</li>
          <li>Implement appropriate technical and organisational measures (see Annex II) to ensure a level of
            security appropriate to the risk.</li>
          <li>Assist the Controller in responding to Data Subject requests (access, erasure, rectification)
            within 30 days of receipt via the Shopify GDPR webhooks.</li>
          <li>Notify the Controller without undue delay, and in any event within 72 hours, of becoming aware
            of a Personal Data breach affecting the Controller&apos;s data.</li>
          <li>Make available to the Controller information necessary to demonstrate compliance with this DPA.</li>
          <li>Upon termination, delete or return all Personal Data within 30 days, unless retention is
            required by law.</li>
        </ul>

        <h2>8. Sub-processors</h2>
        <p>
          The Controller hereby grants general authorisation to engage the following Sub-processors:
        </p>
        <table>
          <thead>
            <tr>
              <th>Sub-processor</th>
              <th>Purpose</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Google LLC (Gemini API)</td>
              <td>AI image generation and classification</td>
              <td>EU / US</td>
            </tr>
            <tr>
              <td>Supabase (database hosting)</td>
              <td>Storage of merchant and catalog data</td>
              <td>EU</td>
            </tr>
            <tr>
              <td>Vercel Inc.</td>
              <td>Application hosting and API routing</td>
              <td>Global edge</td>
            </tr>
            <tr>
              <td>Shopify Inc.</td>
              <td>Subscription billing and payment processing (via the Shopify Billing API)</td>
              <td>EU / US / Canada</td>
            </tr>
          </tbody>
        </table>
        <p>
          The Processor shall notify the Controller of any intended changes to the list of Sub-processors via
          the App dashboard or by email at least 15 days before the change takes effect. The Controller may
          object to the addition of a new Sub-processor by uninstalling the App and terminating the service.
        </p>

        <h2>9. International data transfers</h2>
        <p>
          Where Personal Data is transferred outside the EU/UK (e.g., to Google or Shopify), such transfers
          are safeguarded by the EU Standard Contractual Clauses (SCCs) incorporated into the Sub-processors&apos;
          terms, and/or adequacy decisions where applicable.
        </p>

        <h2>10. Data subject rights</h2>
        <p>
          Data Subject requests should be sent to the Controller, who is the primary point of contact. The
          Processor will assist the Controller in fulfilling such requests via the Shopify customers/data_request,
          customers/redact, and shop/redact webhooks. Since the Processor does not store customer photos, the
          Processor has no photo data to export or delete for a given Data Subject.
        </p>

        <h2>11. Audit rights</h2>
        <p>
          The Controller may request, once per calendar year and with 30 days&apos; notice, a written audit
          report summarising the Processor&apos;s compliance with this DPA. On-site audits are not available
          by default for small-plan merchants and may be subject to reasonable fees for enterprise customers.
        </p>

        <h2>12. Liability</h2>
        <p>
          The Processor&apos;s aggregate liability arising out of or relating to this DPA shall not exceed
          the fees paid by the Controller to the Processor in the 12 months preceding the event giving rise
          to the claim. This limitation does not apply to damages that cannot be excluded by law.
        </p>

        <h2>13. Termination</h2>
        <p>
          This DPA terminates automatically when the App is uninstalled from the Controller&apos;s Shopify
          store. Upon termination, the Processor will delete or anonymise all Personal Data within 30 days
          unless retention is required by law.
        </p>

        <h2>14. Governing law</h2>
        <p>
          This DPA is governed by the laws of Spain and subject to the jurisdiction of the competent courts
          of the Processor&apos;s registered domicile, unless local mandatory consumer or data protection laws
          state otherwise.
        </p>

        <h2>Annex I — Processing details</h2>
        <p><strong>Subject matter:</strong> AI virtual try-on and cross-sell recommendation service.</p>
        <p><strong>Duration:</strong> for the duration of App installation, terminating on uninstall.</p>
        <p><strong>Nature and purpose:</strong> real-time image generation and catalog-based recommendation.</p>
        <p><strong>Data subjects:</strong> end customers of the Controller; Controller staff.</p>
        <p><strong>Data categories:</strong> customer photos (not stored); merchant account data; catalog metadata.</p>

        <h2>Annex II — Security measures</h2>
        <ul>
          <li>Encryption in transit (TLS 1.2+) for all connections.</li>
          <li>Shopify access tokens stored server-side only; API keys SHA-256 hashed.</li>
          <li>Row-Level Security enabled on database tables; access restricted to service role only.</li>
          <li>Role-based access within Processor staff; least-privilege enforced.</li>
          <li>HMAC-SHA256 verification of all incoming webhooks.</li>
          <li>CORS allowlist enforced on all public API endpoints.</li>
          <li>SSRF protection on image-proxy endpoints (blocks private IP ranges and metadata endpoints).</li>
          <li>Rate limiting and daily attempt caps to mitigate abuse and cost damage.</li>
          <li>Regular dependency updates and security patching.</li>
          <li>Incident response plan with 72-hour breach notification.</li>
        </ul>

        <hr />
        <p className="text-slate-400 text-xs">
          Contact: <a href="mailto:infoagalaz@gmail.com">infoagalaz@gmail.com</a> — Agalaz Virtual Try-On — version 1.0
        </p>
      </div>
    </div>
  );
}
