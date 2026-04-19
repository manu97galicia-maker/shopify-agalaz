import Link from 'next/link';

const ASSETS = [
  { slug: 'feature-banner', title: 'Feature banner', dims: '1600 × 900', role: 'App listing header' },
  { slug: 'screenshot-01', title: 'Screenshot 1 — Try-on button', dims: '1600 × 900', role: 'Product page integration' },
  { slug: 'screenshot-02', title: 'Screenshot 2 — AI result', dims: '1600 × 900', role: 'Photorealistic try-on' },
  { slug: 'screenshot-03', title: 'Screenshot 3 — Cross-sell', dims: '1600 × 900', role: 'Smart recommendations' },
  { slug: 'screenshot-04', title: 'Screenshot 4 — Pricing', dims: '1600 × 900', role: 'Trial & plans' },
];

export default function PreviewIndex() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-slate-900 mb-2">App Store Assets</h1>
        <p className="text-sm text-slate-500 mb-8">
          Each link opens a page rendered at exactly <strong>1600×900px</strong>. Capture each one as a PNG for the Shopify App Store listing.
        </p>

        <ol className="space-y-3 mb-10">
          {ASSETS.map((a, i) => (
            <li key={a.slug}>
              <Link
                href={`/preview/${a.slug}`}
                target="_blank"
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-indigo-600 text-white rounded-lg text-xs font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="font-bold text-slate-900">{a.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 ml-8 mt-0.5">{a.role}</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">{a.dims}</span>
              </Link>
            </li>
          ))}
        </ol>

        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
          <h2 className="font-bold text-slate-900 text-sm">How to capture as PNG</h2>
          <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
            <li>Open each preview link in Chrome.</li>
            <li>Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">F12</kbd> to open DevTools.</li>
            <li>Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">Cmd+Shift+P</kbd> (Mac) or <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">Ctrl+Shift+P</kbd> (Windows).</li>
            <li>Type <em>Capture full size screenshot</em> → Enter.</li>
            <li>Chrome downloads a PNG at the exact 1600×900 size.</li>
            <li>Upload to Shopify Partner Dashboard → App Listing → Screenshots.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
