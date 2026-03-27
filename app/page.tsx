import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-serif text-xl tracking-[0.15em] text-slate-900 font-black">AGALAZ</span>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
            Shopify App
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-8">
        <h1 className="font-serif text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Virtual Try-On<br />
          <span className="italic text-indigo-600">for Shopify</span>
        </h1>

        <p className="text-slate-500 text-lg font-light max-w-lg mx-auto">
          Your customers try on clothing, glasses, jewelry & accessories with AI before buying.
          Reduce returns by 40%. Increase conversion by 25%.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 font-bold">
          <span>✓ 2 lines of code</span>
          <span>✓ AI-powered results</span>
          <span>✓ 5 free renders</span>
        </div>

        <div className="pt-4">
          <p className="text-slate-400 text-sm mb-6">
            Install the app from your Shopify admin to get started.
          </p>
          <a
            href="https://agalaz.com/partners"
            className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-[0.15em] text-xs hover:bg-indigo-600 transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Easy Integration',
              desc: 'Install the app, and the virtual try-on button appears automatically on your product pages. No coding required.',
            },
            {
              title: 'Secure by Default',
              desc: 'Domain allowlisting, SHA-256 hashed API keys, and zero data retention. Customer photos are never stored.',
            },
            {
              title: 'AI-Powered',
              desc: 'Photorealistic try-on for clothing, glasses, jewelry, hats, shoes, bags — even tattoos and nail art.',
            },
          ].map((f, i) => (
            <div key={i} className="p-6 border border-slate-100 rounded-2xl space-y-3">
              <h3 className="font-black text-slate-900 text-sm">{f.title}</h3>
              <p className="text-slate-400 text-xs font-light leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="font-serif text-3xl font-black text-slate-900 text-center mb-10">Pricing</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { name: 'Trial', price: 'Free', renders: '5 renders', desc: 'Test the widget on your real store' },
            { name: 'Starter', price: '€150/mo', renders: '200 renders/mo', desc: 'Perfect for boutiques', popular: true },
            { name: 'Growth', price: '€499/mo', renders: '1,000 renders/mo', desc: 'For growing stores' },
          ].map((plan, i) => (
            <div key={i} className={`relative p-6 rounded-2xl border-2 ${plan.popular ? 'border-indigo-600 shadow-lg' : 'border-slate-200'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                  Popular
                </div>
              )}
              <div className="space-y-3">
                <h3 className="font-black text-slate-900">{plan.name}</h3>
                <p className="font-serif text-3xl font-black text-slate-900">{plan.price}</p>
                <p className="text-xs text-indigo-600 font-bold">{plan.renders}</p>
                <p className="text-xs text-slate-400">{plan.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 text-center">
        <p className="text-xs text-slate-300">
          © 2024 Agalaz — <a href="https://agalaz.com" className="text-indigo-400 hover:text-indigo-600">agalaz.com</a>
        </p>
      </footer>
    </div>
  );
}
