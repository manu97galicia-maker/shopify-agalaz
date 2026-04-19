import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Check, ArrowRight, Shield, Zap, Store, Camera, ShoppingBag, Layers } from 'lucide-react';

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
          <span className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> 7-day free trial</span>
          <span className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> 60s results</span>
        </div>

        <div className="flex justify-center">
          <a href={APP_INSTALL_URL}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">
            <Store size={16} /> Install on Shopify
          </a>
        </div>

        {/* Hero image — button shown on product page */}
        <div className="mt-14 flex justify-center">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/60 max-w-2xl w-full">
            <Image
              src="/agalaz-try-on-button.png"
              alt="Agalaz Try-On button on a Shopify product page"
              width={1200}
              height={720}
              className="w-full h-auto"
              priority
            />
          </div>
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

      {/* Cross-sell */}
      <div className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 rounded-full mb-4">
                <Layers size={14} className="text-violet-600" />
                <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">Smart Cross-Sell</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
                One try-on. <span className="text-violet-600">Two sales.</span>
              </h2>
              <p className="text-slate-500 text-base leading-relaxed mb-5">
                After a customer tries on a product, Agalaz instantly recommends a matching item from a different category in your catalog — and lets them add it to cart in one click.
              </p>
              <ul className="space-y-2.5 mb-6">
                <li className="flex items-start gap-2.5 text-sm text-slate-600">
                  <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>Tried a <strong>shirt</strong>? Suggests matching <strong>pants</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-slate-600">
                  <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>Tried a <strong>ring</strong>? Suggests matching <strong>earrings</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-slate-600">
                  <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>AI picks by style, color and category — only suggests products that actually exist in your store.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-slate-600">
                  <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>One-click setup — just sync your catalog from the dashboard.</span>
                </li>
              </ul>
              <p className="text-xs text-slate-400 italic">Higher average order value with zero extra effort.</p>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/60 max-w-sm w-full">
                <Image
                  src="/agalaz-cross-sell.png"
                  alt="Cross-sell: tried a shirt, AI recommends matching outfit"
                  width={800}
                  height={1000}
                  className="w-full h-auto"
                />
              </div>
            </div>
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
              { name: 'Free Trial', price: '€0', period: '/7 days', renders: '50 renders', desc: 'Payment method required. Cancel anytime before day 7.', cta: 'Start Free Trial', href: APP_INSTALL_URL },
              { name: 'Starter', price: '€149', period: '/mo', renders: '200 renders/mo', desc: 'For boutiques & small stores', popular: true, cta: 'Get Started', href: APP_INSTALL_URL },
              { name: 'Growth', price: '€499', period: '/mo', renders: '1,000 renders/mo', desc: 'For high-volume stores', cta: 'Get Started', href: APP_INSTALL_URL },
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
            <Link href="/support" className="hover:text-indigo-600 transition-colors">Help</Link>
            <a href="mailto:infoagalaz@gmail.com" className="hover:text-indigo-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
