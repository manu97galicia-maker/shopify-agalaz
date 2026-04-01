'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Copy, Check, Zap, Shield, BarChart3, ExternalLink, ChevronDown } from 'lucide-react';

const PLANS = [
  { id: 'starter', name: 'Starter', price: 150, renders: 200, extra: '0.75', features: ['200 renders/month', 'Customizable widget'] },
  { id: 'growth', name: 'Growth', price: 499, renders: 1000, extra: '0.50', features: ['1,000 renders/month', 'Customizable widget'], popular: true },
];

const CREDITS_PACK_URL = 'https://buy.stripe.com/fZu6oHfZk1VC4BL8KJfYY0h';
const CREDITS_PACK_AMOUNT = 20;
const CREDITS_PACK_PRICE = '9.99€';

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

// Helper to get session token from App Bridge
async function getShopifySessionToken(): Promise<string | null> {
  try {
    const w = window as any;
    if (w.shopify?.idToken) {
      return await w.shopify.idToken();
    }
  } catch {}
  return null;
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
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('growth');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Initialize App Bridge session token
  useEffect(() => {
    async function initSessionToken() {
      // Wait for App Bridge to load
      const maxWait = 3000;
      const start = Date.now();
      while (Date.now() - start < maxWait) {
        const token = await getShopifySessionToken();
        if (token) {
          setSessionToken(token);
          // Extract shop from token payload
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.dest) {
              const match = payload.dest.match(/([^/]+\.myshopify\.com)/);
              if (match && !shop) setShop(match[1]);
            }
          } catch {}
          break;
        }
        await new Promise(r => setTimeout(r, 200));
      }
    }
    initSessionToken();
  }, []);

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
      // Refresh session token if available
      const token = await getShopifySessionToken();
      if (token) setSessionToken(token);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/partners/profile?shop=${encodeURIComponent(shop)}`, { headers });
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
      const token = await getShopifySessionToken();
      const authHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) authHeaders['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/partners/checkout?shop=${encodeURIComponent(shop)}`, {
        method: 'POST',
        headers: authHeaders,
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
  const creditsPercent = Math.min(100, (profile.credits_remaining / (profile.credits_monthly_limit || 5)) * 100);
  const creditsLow = creditsPercent < 20;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header — clean Shopify-embedded style */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">Agalaz Virtual Try-On</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
              isPaid ? 'bg-indigo-50 text-indigo-600' : hasCredits ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              {isPaid ? profile.plan : hasCredits ? 'Trial' : 'No credits'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-6 space-y-5">

        {/* ─── Welcome Banner (first install) ─── */}
        {apiKey && (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2.5">
              <Check size={18} className="text-emerald-600" />
              <span className="font-bold text-emerald-900">App installed! 5 free renders ready.</span>
            </div>
            <div>
              <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Your API Key (copy it now)</label>
              <div className="flex gap-2 mt-1">
                <code className="flex-1 px-3 py-2 bg-white border border-emerald-200 rounded-lg text-xs font-mono text-emerald-900 break-all">
                  {apiKey}
                </code>
                <button onClick={() => copyToClipboard(apiKey, 'apikey')}
                  className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  {copied === 'apikey' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Credits</p>
            <p className={`text-2xl font-black mt-1 ${creditsLow ? 'text-red-600' : 'text-slate-900'}`}>
              {profile.credits_remaining}
            </p>
            <div className="h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${creditsLow ? 'bg-red-500' : 'bg-indigo-600'}`}
                style={{ width: `${creditsPercent}%` }} />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Renders</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{profile.total_renders || 0}</p>
            <p className="text-[10px] text-slate-300 mt-2">all time</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-2 h-2 rounded-full ${profile.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-sm font-bold text-slate-900">{profile.is_active ? 'Active' : 'Off'}</span>
            </div>
            <p className="text-[10px] text-slate-300 mt-2">
              {profile.api_key_prefix && profile.api_key_prefix !== 'pending'
                ? <span>Key: <code className="font-mono">{profile.api_key_prefix}...</code></span>
                : 'No key'
              }
            </p>
          </div>
        </div>

        {/* ─── Quick Actions ─── */}
        {isPaid && (
          <div className="flex gap-3">
            <a href={`${CREDITS_PACK_URL}?client_reference_id=${profile.id}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-all flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <Zap size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Buy {CREDITS_PACK_AMOUNT} credits</p>
                <p className="text-[10px] text-slate-400">{CREDITS_PACK_PRICE} one-time</p>
              </div>
            </a>
            {profile.plan === 'starter' && (
              <button onClick={() => { setSelectedPlan('growth'); handleSubscribe(); }}
                disabled={isSubmitting}
                className="flex-1 p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-300 transition-all flex items-center gap-3 disabled:opacity-50">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <BarChart3 size={16} className="text-amber-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900">Upgrade to Growth</p>
                  <p className="text-[10px] text-slate-400">1,000 renders/mo</p>
                </div>
              </button>
            )}
          </div>
        )}

        {/* ─── Paywall ─── */}
        {showPaywall && (
          <div className="bg-white border-2 border-amber-300 rounded-xl p-6 space-y-5">
            <div className="text-center space-y-1">
              <Zap size={24} className="text-amber-500 mx-auto" />
              <h2 className="text-lg font-black text-slate-900">Free trial ended</h2>
              <p className="text-slate-400 text-sm">Subscribe to reactivate the try-on button.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PLANS.map((plan) => (
                <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    selectedPlan === plan.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'
                  }`}>
                  {plan.popular && (
                    <div className="absolute -top-2 right-3 px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-full">Popular</div>
                  )}
                  <p className="font-black text-slate-900">{plan.name}</p>
                  <p className="text-xl font-black text-slate-900 mt-1">${plan.price === 150 ? '149' : '499'}<span className="text-xs font-normal text-slate-400">/mo</span></p>
                  <p className="text-xs text-indigo-600 font-bold mt-1">{plan.renders} renders/mo</p>
                </button>
              ))}
            </div>
            {error && <p className="text-sm text-red-600 font-bold text-center">{error}</p>}
            <button onClick={handleSubscribe} disabled={isSubmitting}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-600 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Redirecting...' : `Subscribe to ${selectedPlan === 'growth' ? 'Growth' : 'Starter'}`}
            </button>
          </div>
        )}

        {/* ─── Setup Guide (concise) ─── */}
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          <div className="p-4">
            <h2 className="font-bold text-slate-900">Quick Setup</h2>
          </div>
          <a href={`https://${shop}/admin/themes/current/editor`} target="_top"
            className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">1</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">Enable theme extension</p>
              <p className="text-xs text-slate-400">Theme Editor → App Embeds → Agalaz Virtual Try-On → activate</p>
            </div>
            <ExternalLink size={14} className="text-slate-300" />
          </a>
          <div className="flex items-center gap-3 p-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">2</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">Paste your API key</p>
              <p className="text-xs text-slate-400">
                In the extension settings, paste your key
                {profile.api_key_prefix && profile.api_key_prefix !== 'pending' && (
                  <code className="ml-1 px-1 py-0.5 bg-slate-100 rounded text-[10px]">{profile.api_key_prefix}...</code>
                )}
              </p>
            </div>
          </div>
          <a href={`https://${shop}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-black shrink-0">3</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">Test on your store</p>
              <p className="text-xs text-slate-400">Visit a product page and click "Try it on with AI"</p>
            </div>
            <ExternalLink size={14} className="text-slate-300" />
          </a>
        </div>

        {/* ─── FAQ (compact) ─── */}
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          <div className="p-4">
            <h2 className="font-bold text-slate-900">FAQ</h2>
          </div>
          {[
            { q: 'How does the trial work?', a: '5 free renders. Each customer try-on uses 1 credit. No credit card needed.' },
            { q: 'What can customers try on?', a: 'Clothing, glasses, jewelry, hats, shoes, bags — the AI detects the product type automatically.' },
            { q: 'Are customer photos stored?', a: 'No. Photos are processed in real-time and immediately discarded. Zero data retention.' },
            { q: 'How fast is rendering?', a: '10-30 seconds depending on image quality.' },
            { q: 'Can I cancel?', a: 'Yes, anytime. Monthly subscriptions managed via Stripe.' },
          ].map((faq, i) => (
            <div key={i}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors">
                <span className="text-sm font-bold text-slate-900 pr-4">{faq.q}</span>
                <ChevronDown size={14} className={`text-slate-300 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 -mt-1">
                  <p className="text-xs text-slate-500">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ─── Support ─── */}
        <p className="text-center text-xs text-slate-300 py-2">
          Need help? <a href="mailto:support@agalaz.com" className="text-indigo-500 font-bold">support@agalaz.com</a>
        </p>
      </div>
    </div>
  );
}
