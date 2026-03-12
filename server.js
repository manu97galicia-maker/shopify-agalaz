require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { nodeRuntime } = require('@shopify/shopify-api/adapters/node');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Shopify API Config ---
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: (process.env.SHOPIFY_SCOPES || '').split(','),
  hostName: (process.env.SHOPIFY_APP_URL || '').replace(/https?:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  runtime: nodeRuntime,
});

// In-memory store (replace with DB in production)
const shops = {};

// --- Middleware ---
app.use(express.json());

// Verify Shopify HMAC for proxy requests
function verifyProxy(req, res, next) {
  const { signature, ...params } = req.query;
  if (!signature) return res.status(401).json({ error: 'Unauthorized' });

  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('');
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(sorted)
    .digest('hex');

  if (hash !== signature) return res.status(401).json({ error: 'Invalid signature' });
  next();
}

// --- Auth Routes ---
app.get('/api/auth', async (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send('Missing shop parameter');

  const authRoute = await shopify.auth.begin({
    shop,
    callbackPath: '/api/auth/callback',
    isOnline: false,
    rawRequest: req,
    rawResponse: res,
  });
});

app.get('/api/auth/callback', async (req, res) => {
  try {
    const callback = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    shops[callback.session.shop] = {
      accessToken: callback.session.accessToken,
      scope: callback.session.scope,
      installedAt: new Date().toISOString(),
      plan: 'free',
      rendersUsed: 0,
      rendersLimit: 10, // Free trial renders
    };

    // Redirect to app dashboard in Shopify admin
    const host = req.query.host;
    res.redirect(`https://${callback.session.shop}/admin/apps/${process.env.SHOPIFY_API_KEY}`);
  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).send('Auth failed');
  }
});

// --- App Proxy: Try-On Generation ---
app.post('/api/proxy/generate', verifyProxy, async (req, res) => {
  const shop = req.query.shop;
  const shopData = shops[shop];

  if (!shopData) {
    return res.status(401).json({ error: 'Shop not installed' });
  }

  // Check render limits
  if (shopData.rendersUsed >= shopData.rendersLimit) {
    return res.status(403).json({
      error: 'Render limit reached',
      message: 'Upgrade your plan for more renders',
      upgradeUrl: `https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}/billing`,
    });
  }

  try {
    const { faceImage, bodyImage, clothingImage } = req.body;

    // Call Agalaz API
    const response = await fetch(`${process.env.AGALAZ_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AGALAZ_API_SECRET}`,
        'X-Shop': shop,
      },
      body: JSON.stringify({ faceImage, bodyImage, clothingImage }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json(err);
    }

    const result = await response.json();

    // Increment usage
    shopData.rendersUsed++;

    return res.json({
      success: true,
      image: result.image,
      rendersRemaining: shopData.rendersLimit - shopData.rendersUsed,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return res.status(500).json({ error: 'Generation failed' });
  }
});

// --- Billing Routes ---
app.get('/api/billing/plans', (req, res) => {
  res.json({
    plans: [
      { id: 'starter', name: 'Starter', price: 49, renders: 500, interval: 'EVERY_30_DAYS' },
      { id: 'growth', name: 'Growth', price: 149, renders: 2000, interval: 'EVERY_30_DAYS' },
      { id: 'enterprise', name: 'Enterprise', price: 399, renders: 10000, interval: 'EVERY_30_DAYS' },
    ],
  });
});

app.post('/api/billing/subscribe', async (req, res) => {
  const shop = req.query.shop;
  const { planId } = req.body;
  const shopData = shops[shop];

  if (!shopData) return res.status(401).json({ error: 'Shop not installed' });

  const plans = {
    starter: { name: 'Agalaz Starter', price: 49, renders: 500 },
    growth: { name: 'Agalaz Growth', price: 149, renders: 2000 },
    enterprise: { name: 'Agalaz Enterprise', price: 399, renders: 10000 },
  };

  const plan = plans[planId];
  if (!plan) return res.status(400).json({ error: 'Invalid plan' });

  try {
    // Create Shopify recurring charge
    const client = new shopify.clients.Rest({
      session: { shop, accessToken: shopData.accessToken },
    });

    const charge = await client.post({
      path: 'recurring_application_charges',
      data: {
        recurring_application_charge: {
          name: plan.name,
          price: plan.price,
          return_url: `${process.env.SHOPIFY_APP_URL}/api/billing/confirm?shop=${shop}&plan=${planId}`,
          trial_days: 7,
          test: process.env.NODE_ENV !== 'production',
        },
      },
    });

    res.json({ confirmationUrl: charge.body.recurring_application_charge.confirmation_url });
  } catch (error) {
    console.error('Billing error:', error);
    res.status(500).json({ error: 'Billing failed' });
  }
});

app.get('/api/billing/confirm', async (req, res) => {
  const { shop, plan, charge_id } = req.query;
  const shopData = shops[shop];

  if (!shopData) return res.status(401).send('Shop not found');

  const plans = {
    starter: { renders: 500 },
    growth: { renders: 2000 },
    enterprise: { renders: 10000 },
  };

  shopData.plan = plan;
  shopData.rendersLimit = plans[plan].renders;
  shopData.rendersUsed = 0;

  res.redirect(`https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}`);
});

// --- Dashboard API ---
app.get('/api/shop/status', (req, res) => {
  const shop = req.query.shop;
  const shopData = shops[shop];
  if (!shopData) return res.status(404).json({ error: 'Shop not found' });

  res.json({
    plan: shopData.plan,
    rendersUsed: shopData.rendersUsed,
    rendersLimit: shopData.rendersLimit,
    rendersRemaining: shopData.rendersLimit - shopData.rendersUsed,
  });
});

// --- Health ---
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Agalaz Shopify App running on port ${PORT}`);
});
