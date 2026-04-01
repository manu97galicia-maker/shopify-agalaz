import Link from 'next/link';
import { Sparkles, Check, ArrowRight, Shield, Zap, Store } from 'lucide-react';

export default function HomePage() {
  const APP_INSTALL_URL = 'https://admin.shopify.com/?organization_id=210039164&no_redirect=true&redirect=/oauth/redirect_from_developer_dashboard?client_id%3D7523a3b92a09addee08857ff2f4e55f7';

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-serif text-xl tracking-[0.15em] text-slate-900 font-black">AGALAZ</span>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors">
              Dashboard
            </Link>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
              Shopify App
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
          <Sparkles size={14} className="text-emerald-600" />
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">5 free renders included</span>
        </div>

        <h1 className="font-serif text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Virtual Try-On<br />
          <span className="italic text-indigo-600">for Shopify</span>
        </h1>

        <p className="text-slate-500 text-lg font-light max-w-lg mx-auto">
          Your customers try on clothing, glasses, jewelry & accessories with AI before buying.
          Reduce returns. Increase conversion.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 font-bold">
          <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> Zero setup</span>
          <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> AI-powered results</span>
          <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> 5 free renders</span>
        </div>

        {/* CTA */}
        <div className="pt-4 space-y-4">
          <a
            href={APP_INSTALL_URL}
            className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-[0.15em] text-xs hover:bg-indigo-600 transition-colors"
          >
            <Store size={16} /> Install on Shopify <ArrowRight size={14} />
          </a>
          <p className="text-slate-300 text-xs">Free to install. No credit card required.</p>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="font-serif text-2xl font-black text-slate-900 text-center mb-10">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              num: '1',
              title: 'Install the app',
              desc: 'One click from your Shopify admin. The try-on button appears automatically on all product pages.',
            },
            {
              num: '2',
              title: 'Customer tries on',
              desc: 'Your customer uploads a photo, picks a product, and sees how it looks on them in under 60 seconds.',
            },
            {
              num: '3',
              title: 'They buy with confidence',
              desc: 'Customers who try on are more likely to buy and less likely to return. Fewer returns, more revenue.',
            },
          ].map((step, i) => (
            <div key={i} className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-black mx-auto">
                {step.num}
              </div>
              <h3 className="font-black text-slate-900">{step.title}</h3>
              <p className="text-slate-400 text-sm font-light leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Store size={20} className="text-indigo-600" />,
                title: 'Zero Code Setup',
                desc: 'Install the app and the try-on button appears automatically. No theme editing needed.',
              },
              {
                icon: <Shield size={20} className="text-emerald-600" />,
                title: 'Privacy First',
                desc: 'Customer photos are never stored. Processed in real-time and discarded immediately.',
              },
              {
                icon: <Zap size={20} className="text-amber-600" />,
                title: 'AI-Powered',
                desc: 'Works with clothing, glasses, jewelry, hats, shoes, bags and more. Detects product type automatically.',
              },
            ].map((f, i) => (
              <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3">
                {f.icon}
                <h3 className="font-black text-slate-900 text-sm">{f.title}</h3>
                <p className="text-slate-400 text-xs font-light leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl font-black text-slate-900 text-center mb-4">Pricing</h2>
        <p className="text-slate-400 text-sm text-center mb-10">Start free. Upgrade when you grow.</p>
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { name: 'Trial', price: 'Free', renders: '5 renders', desc: 'Test the widget on your real store', cta: 'Install Free', href: APP_INSTALL_URL },
            { name: 'Starter', price: '$149/mo', renders: '200 renders/mo', desc: 'Perfect for boutiques', popular: true, cta: 'Get Started', href: APP_INSTALL_URL },
            { name: 'Growth', price: '$499/mo', renders: '1,000 renders/mo', desc: 'For high-volume stores', cta: 'Get Started', href: APP_INSTALL_URL },
          ].map((plan, i) => (
            <div key={i} className={`relative p-6 rounded-2xl border-2 flex flex-col ${plan.popular ? 'border-indigo-600 shadow-lg' : 'border-slate-200'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                  Popular
                </div>
              )}
              <div className="space-y-3 flex-1">
                <h3 className="font-black text-slate-900">{plan.name}</h3>
                <p className="font-serif text-3xl font-black text-slate-900">{plan.price}</p>
                <p className="text-xs text-indigo-600 font-bold">{plan.renders}</p>
                <p className="text-xs text-slate-400">{plan.desc}</p>
              </div>
              <a
                href={plan.href}
                className={`mt-6 block text-center py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                  plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-300 text-xs mt-6">
          All plans start with a free trial. Upgrade from the app dashboard after installation.
        </p>
      </div>

      {/* Final CTA */}
      <div className="bg-slate-900 py-16 text-center">
        <h2 className="font-serif text-3xl font-black text-white mb-4">Ready to boost your sales?</h2>
        <p className="text-white/50 text-sm mb-8">Install in 30 seconds. No credit card needed.</p>
        <a
          href={APP_INSTALL_URL}
          className="inline-flex items-center gap-3 px-10 py-4 bg-white text-slate-900 rounded-xl font-black uppercase tracking-[0.15em] text-xs hover:bg-indigo-50 transition-colors"
        >
          <Sparkles size={16} /> Install on Shopify <ArrowRight size={14} />
        </a>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-300">
            © 2026 Agalaz — <a href="https://agalaz.com" className="text-indigo-400 hover:text-indigo-600">agalaz.com</a>
          </p>
          <div className="flex gap-4 text-xs text-slate-300">
            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms</Link>
            <a href="mailto:support@agalaz.com" className="hover:text-indigo-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
