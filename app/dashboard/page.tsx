'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Copy, Check, Zap, Shield, BarChart3, ExternalLink, ChevronDown } from 'lucide-react';

const PLANS = [
  { id: 'starter', name: 'Starter', price: 150, renders: 200, extra: '0.75', features: ['200 renders/month', 'Customizable widget'] },
  { id: 'growth', name: 'Growth', price: 499, renders: 1000, extra: '0.50', features: ['1,000 renders/month', 'Customizable widget'], popular: true },
];

interface PartnerProfile {
  id: string;
  store_name: string;
  store_url: string;
  plan: string;
  is_active: boolean;
  credits_remaining: number;
  credits_monthly_limit: number;
  total_renders: number;
  api_key_prefix: string | null;
  has_api_key: boolean;
  has_subscription: boolean;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-sm font-bold">Loading...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';
  const subscribed = searchParams.get('subscribed') === 'true';

  // Detect shop from multiple sources: URL param, Shopify host param, referrer
  const [shop, setShop] = useState(() => {
    const fromParam = searchParams.get('shop') || '';
    if (fromParam) return fromParam;
    // Shopify sometimes passes host instead of shop
    const host = searchParams.get('host') || '';
    if (host) {
      try {
        const decoded = atob(host);
        const match = decoded.match(/([^/]+\.myshopify\.com)/);
        if (match) return match[1];
      } catch {}
    }
    return '';
  });

  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('growth');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Try to detect shop from URL on client side
  useEffect(() => {
    if (shop) return;
    // Check referrer for shop domain
    try {
      const ref = document.referrer;
      if (ref) {
        const match = ref.match(/([^/]+\.myshopify\.com)/);
        if (match) { setShop(match[1]); return; }
      }
    } catch {}
    // Check ancestor origin (Shopify iframe)
    try {
      if (window.location.ancestorOrigins?.length > 0) {
        const ancestor = window.location.ancestorOrigins[0];
        const match = ancestor.match(/([^/]+\.myshopify\.com)/);
        if (match) { setShop(match[1]); return; }
      }
    } catch {}
    // Check URL hash or full URL
    const fullUrl = window.location.href;
    const shopMatch = fullUrl.match(/[?&]shop=([^&]+)/);
    if (shopMatch) setShop(decodeURIComponent(shopMatch[1]));
  }, []);

  useEffect(() => {
    if (!shop) return;
    loadProfile();
  }, [shop]);

  useEffect(() => {
    if (subscribed && shop) {
      loadProfile();
    }
  }, [subscribed]);

  async function loadProfile() {
    try {
      const res = await fetch(`/api/partners/profile?shop=${encodeURIComponent(shop)}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.partner);
      } else if (res.status === 404) {
        // No partner found — auto-setup this Shopify store
        await autoSetupShop();
        return;
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
    setLoading(false);
  }

  async function autoSetupShop() {
    try {
      const res = await fetch('/api/shop/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop }),
      });
      const data = await res.json();
      if (data.api_key) {
        setApiKey(data.api_key);
      }
      // Reload profile after setup
      const profileRes = await fetch(`/api/partners/profile?shop=${encodeURIComponent(shop)}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.partner);
      }
    } catch (e) {
      console.error('Auto-setup failed:', e);
    }
    setLoading(false);
  }

  async function fetchApiKeyFromCookie() {
    try {
      const cookies = document.cookie.split(';').map(c => c.trim());
      const keyPair = cookies.find(c => c.startsWith('agalaz_api_key='));
      if (keyPair) {
        setApiKey(decodeURIComponent(keyPair.split('=')[1]));
        // Clear cookie after reading
        document.cookie = 'agalaz_api_key=; max-age=0; path=/';
      }
    } catch {}
  }

  async function handleSubscribe() {
    if (!profile) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/partners/checkout?shop=${encodeURIComponent(shop)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          partnerId: profile.id,
          email: '', // Will be fetched from Stripe
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.top ? window.top.location.href = data.url : window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to start checkout');
      }
    } catch {
      setError('Something went wrong');
    }
    setIsSubmitting(false);
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-sm font-bold">Loading dashboard...</div>
      </div>
    );
  }

  if (!shop && !loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          <h1 className="font-serif text-2xl font-black text-slate-900">Agalaz Virtual Try-On</h1>
          <p className="text-slate-400 text-sm">Please open this app from your Shopify admin panel.</p>
          <div className="pt-4">
            <input
              type="text"
              placeholder="your-store.myshopify.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-center"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) setShop(val.includes('.myshopify.com') ? val : val + '.myshopify.com');
                }
              }}
            />
            <p className="text-[10px] text-slate-300 mt-2">Or enter your shop domain and press Enter</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-serif text-2xl font-black text-slate-900">Store Not Found</h1>
          <p className="text-slate-400 text-sm">
            No Agalaz account found for {shop}. Please reinstall the app.
          </p>
        </div>
      </div>
    );
  }

  const isPaid = profile.has_subscription;
  const hasCredits = profile.credits_remaining > 0;
  const showPaywall = !isPaid && !hasCredits;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-indigo-600" />
            <span className="font-serif text-lg font-black text-slate-900 tracking-tight">AGALAZ</span>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full">
              {profile.plan}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-bold">{profile.store_name}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* ─── Welcome Banner (new installs or auto-setup) ─── */}
        {apiKey && (
          <div className="p-6 bg-emerald-50 border-2 border-emerald-200 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Check size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-black text-emerald-900 text-lg">App Installed Successfully!</h2>
                <p className="text-emerald-600 text-xs">Your store is ready with 5 free try-on renders.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                Your API Key (save it now — shown only once)
              </label>
              <div className="flex gap-2">
                <code className="flex-1 px-4 py-3 bg-white border border-emerald-200 rounded-xl text-sm font-mono text-emerald-900 break-all">
                  {apiKey}
                </code>
                <button
                  onClick={() => copyToClipboard(apiKey, 'apikey')}
                  className="px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  {copied === 'apikey' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-[10px] text-emerald-500">
                This key is used by the theme extension to authenticate try-on requests.
              </p>
            </div>
          </div>
        )}

        {/* ─── Credits Overview ─── */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-5 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Credits Remaining</span>
            <p className="font-serif text-3xl font-black text-slate-900">{profile.credits_remaining}</p>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${Math.min(100, (profile.credits_remaining / (profile.credits_monthly_limit || 5)) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-300">of {profile.credits_monthly_limit} {isPaid ? '/month' : 'free trial'}</p>
          </div>

          <div className="p-5 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Renders</span>
            <p className="font-serif text-3xl font-black text-slate-900">{profile.total_renders || 0}</p>
            <p className="text-[10px] text-slate-300">all-time generations</p>
          </div>

          <div className="p-5 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${profile.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <p className="font-black text-slate-900">{profile.is_active ? 'Active' : 'Inactive'}</p>
            </div>
            <p className="text-[10px] text-slate-300">
              {isPaid ? `${profile.plan} plan` : hasCredits ? 'Free trial' : 'No credits'}
            </p>
          </div>
        </div>

        {/* ─── Paywall (when trial ends) ─── */}
        {showPaywall && (
          <div className="p-8 border-2 border-amber-300 bg-amber-50 rounded-2xl space-y-6">
            <div className="text-center space-y-2">
              <Zap size={28} className="text-amber-500 mx-auto" />
              <h2 className="font-serif text-2xl font-black text-slate-900">Trial Ended</h2>
              <p className="text-slate-500 text-sm">Your 5 free renders have been used. Subscribe to keep the try-on widget active.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                    selectedPlan === plan.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                      Popular
                    </div>
                  )}
                  <h3 className="font-black text-slate-900">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-serif text-2xl font-black text-slate-900">€{plan.price}</span>
                    <span className="text-slate-400 text-xs">/month</span>
                  </div>
                  <p className="text-xs text-indigo-600 font-bold mt-1">{plan.renders} renders/month</p>
                  <ul className="mt-3 space-y-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Check size={12} className="text-emerald-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-600 font-bold text-center">{error}</p>
            )}

            <button
              onClick={handleSubscribe}
              disabled={isSubmitting}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-[0.15em] text-xs hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Redirecting to Stripe...' : `Subscribe to ${selectedPlan === 'growth' ? 'Growth' : 'Starter'}`}
            </button>
          </div>
        )}

        {/* ─── Integration Guide ─── */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-black text-slate-900">Setup Guide</h2>

          {/* Step 1: Theme Extension */}
          <div className="p-6 border border-slate-200 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">1</div>
              <h3 className="font-black text-slate-900">Enable the Theme Extension</h3>
            </div>
            <p className="text-sm text-slate-500 pl-11">
              Go to your Shopify admin → <strong>Online Store → Themes → Customize</strong>.
              Add the <strong>"Agalaz Virtual Try-On"</strong> block to your product page template.
              The try-on button will appear automatically on all product pages.
            </p>
            <div className="pl-11">
              <a
                href={`https://${shop}/admin/themes/current/editor`}
                target="_top"
                className="inline-flex items-center gap-2 text-xs text-indigo-600 font-bold hover:text-indigo-800"
              >
                Open Theme Editor <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Step 2: API Key */}
          <div className="p-6 border border-slate-200 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">2</div>
              <h3 className="font-black text-slate-900">Configure API Key in Theme</h3>
            </div>
            <p className="text-sm text-slate-500 pl-11">
              In the theme editor, click on the Agalaz block and paste your API key.
              {profile.api_key_prefix && profile.api_key_prefix !== 'pending' && (
                <span> Your key starts with: <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">{profile.api_key_prefix}...</code></span>
              )}
            </p>
          </div>

          {/* Step 3: Test */}
          <div className="p-6 border border-slate-200 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black">3</div>
              <h3 className="font-black text-slate-900">Test It</h3>
            </div>
            <p className="text-sm text-slate-500 pl-11">
              Visit any product page on your store. You should see the "Try it on with AI" button.
              Click it, upload a photo, and watch the AI generate a virtual try-on!
            </p>
            <div className="pl-11">
              <a
                href={`https://${shop}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-indigo-600 font-bold hover:text-indigo-800"
              >
                Visit Your Store <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* ─── Alternative: Widget.js Integration ─── */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-black text-slate-900">Alternative: Manual Widget Integration</h2>
          <p className="text-sm text-slate-400">
            If you prefer to add the widget manually instead of using the theme extension:
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Add to theme.liquid &lt;head&gt;</label>
              <div className="relative mt-1">
                <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs overflow-x-auto">
{`<script src="${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'}/widget.js"
  data-api-key="${apiKey || profile.api_key_prefix + '...' || 'YOUR_API_KEY'}">
</script>`}
                </pre>
                <button
                  onClick={() => copyToClipboard(`<script src="${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'}/widget.js" data-api-key="${apiKey || 'YOUR_API_KEY'}"></script>`, 'script')}
                  className="absolute top-2 right-2 p-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  {copied === 'script' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-slate-400" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Add to product template</label>
              <div className="relative mt-1">
                <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs overflow-x-auto">
{`<div id="agalaz-tryon"
  data-garment="{{ product.featured_image | image_url: width: 512 }}">
</div>`}
                </pre>
                <button
                  onClick={() => copyToClipboard('<div id="agalaz-tryon" data-garment="{{ product.featured_image | image_url: width: 512 }}"></div>', 'div')}
                  className="absolute top-2 right-2 p-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  {copied === 'div' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-slate-400" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── FAQ ─── */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-black text-slate-900">FAQ</h2>
          <div className="space-y-2">
            {[
              { q: 'How does the free trial work?', a: 'You get 5 free virtual try-on renders. Each time a customer generates a try-on, 1 credit is consumed. No credit card required for the trial.' },
              { q: 'What happens when credits run out?', a: 'The try-on button stops working until you subscribe to a plan. Your existing data and API key are preserved.' },
              { q: 'What items can customers try on?', a: 'Clothing, glasses, jewelry, hats, shoes, bags, and even tattoos or nail art. The AI detects the item type automatically from the product image.' },
              { q: 'Do you store customer photos?', a: 'No. Customer images are processed in real-time and never stored. Zero data retention policy.' },
              { q: 'How fast is the rendering?', a: 'Average render time is 10-30 seconds depending on image quality.' },
              { q: 'Can I cancel anytime?', a: 'Yes. Monthly subscriptions can be cancelled anytime from your Stripe billing portal.' },
            ].map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-sm pr-4">{faq.q}</span>
                  <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 -mt-1">
                    <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Support ─── */}
        <div className="text-center py-6 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Questions? <a href="mailto:infoagalaz@gmail.com" className="text-indigo-600 font-bold hover:text-indigo-800">infoagalaz@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
