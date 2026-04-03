import Link from 'next/link';
import { Sparkles, Check, ArrowRight, Shield, Zap, Store, Camera, ShoppingBag } from 'lucide-react';

export default function HomePage() {
  const APP_INSTALL_URL = 'https://admin.shopify.com/?organization_id=210039164&no_redirect=true&redirect=/oauth/redirect_from_developer_dashboard?client_id%3D7523a3b92a09addee08857ff2f4e55f7';

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
      {/* Nav */}
      <nav className="border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">Agalaz</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 text-xs font-semibold hover:text-indigo-600 transition-colors hidden md:block">
              Dashboard
            </Link>
            <a href={APP_INSTALL_URL}
              className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
              Install App
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-8">
          <Sparkles size={14} className="text-indigo-600" />
          <span className="text-xs font-semibold text-indigo-600">AI Virtual Try-On for Shopify</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
          Let customers try on
          <br />
          <span className="text-indigo-600">before they buy</span>
        </h1>

        <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed mb-8">
          Add an AI-powered try-on button to your product pages. Customers upload a photo and see how your products look on them instantly.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-slate-500 font-medium mb-10">
          <span className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> Zero code setup</span>
          <span className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> 5 free renders</span>
          <span className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> 60s results</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href={APP_INSTALL_URL}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">
            <Store size={16} /> Install on Shopify
          </a>
          <Link href="/embed?lang=en&sizes=XS,S,M,L,XL"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
            <Camera size={16} /> See Demo
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider text-center mb-2">How it works</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-12">Three steps to more sales</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '1',
                icon: <Store size={22} className="text-indigo-600" />,
                title: 'Install the app',
                desc: 'One click from your Shopify admin. A try-on button appears on all product pages automatically.',
              },
              {
                num: '2',
                icon: <Camera size={22} className="text-indigo-600" />,
                title: 'Customer uploads a photo',
                desc: 'They take a selfie or choose from gallery. The AI generates a photorealistic try-on in under 60 seconds.',
              },
              {
                num: '3',
                icon: <ShoppingBag size={22} className="text-indigo-600" />,
                title: 'They buy with confidence',
                desc: 'Seeing the product on themselves reduces doubt. Fewer returns, higher conversion rates.',
              },
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  {step.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider text-center mb-2">Features</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-12">Built for Shopify merchants</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Store size={20} className="text-indigo-600" />,
                title: 'Zero Code Setup',
                desc: 'Install the app and the try-on button appears on product pages. No theme editing required.',
              },
              {
                icon: <Shield size={20} className="text-emerald-600" />,
                title: 'Privacy First',
                desc: 'Customer photos are never stored. Processed in real-time and discarded immediately after rendering.',
              },
              {
                icon: <Zap size={20} className="text-amber-600" />,
                title: 'Works with Everything',
                desc: 'Clothing, glasses, jewelry, hats, shoes, bags and more. The AI detects the product type automatically.',
              },
            ].map((f, i) => (
              <div key={i} className="p-6 border border-slate-200 rounded-2xl space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider text-center mb-2">Pricing</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-3">Start free, upgrade anytime</h2>
          <p className="text-slate-400 text-sm text-center mb-12">No credit card required. Cancel anytime.</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { name: 'Trial', price: 'Free', renders: '5 renders', desc: 'Test on your real store', cta: 'Install Free', href: APP_INSTALL_URL },
              { name: 'Starter', price: '$149', period: '/mo', renders: '200 renders/mo', desc: 'For boutiques & small stores', popular: true, cta: 'Get Started', href: APP_INSTALL_URL },
              { name: 'Growth', price: '$499', period: '/mo', renders: '1,000 renders/mo', desc: 'For high-volume stores', cta: 'Get Started', href: APP_INSTALL_URL },
            ].map((plan, i) => (
              <div key={i} className={`relative bg-white p-6 rounded-2xl border-2 flex flex-col ${plan.popular ? 'border-indigo-600 shadow-lg shadow-indigo-100' : 'border-slate-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Popular
                  </div>
                )}
                <div className="space-y-1 mb-6">
                  <p className="text-sm font-bold text-slate-500">{plan.name}</p>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                    {plan.period && <span className="text-sm text-slate-400">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-indigo-600 font-semibold">{plan.renders}</p>
                </div>
                <p className="text-sm text-slate-400 mb-6 flex-1">{plan.desc}</p>
                <a href={plan.href}
                  className={`block text-center py-3 rounded-lg text-sm font-bold transition-colors ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-slate-900 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to reduce returns?</h2>
        <p className="text-white/50 text-base mb-10 max-w-md mx-auto">Install in 30 seconds. Your customers will see a try-on button on every product page.</p>
        <a href={APP_INSTALL_URL}
          className="inline-flex items-center gap-2.5 px-10 py-4 bg-white text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">
          <Sparkles size={16} /> Install on Shopify <ArrowRight size={14} />
        </a>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center">
              <Sparkles size={10} className="text-white" />
            </div>
            <span className="text-xs text-slate-400">
              © 2026 Agalaz — <a href="https://agalaz.com" className="text-indigo-500 hover:text-indigo-600">agalaz.com</a>
            </span>
          </div>
          <div className="flex gap-4 text-xs text-slate-400">
            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms</Link>
            <a href="mailto:support@agalaz.com" className="hover:text-indigo-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
