const crypto = require('crypto');

module.exports = async (req, res) => {
  const { shop, code, hmac } = req.query;

  if (!shop || !code || !hmac) {
    return res.status(400).send('Missing required parameters');
  }

  // Verify HMAC
  const params = { ...req.query };
  delete params.hmac;
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(sorted)
    .digest('hex');

  if (hash !== hmac) {
    return res.status(401).send('HMAC verification failed');
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }),
    });

    const { access_token } = await tokenResponse.json();

    // TODO: Store access_token in database (Supabase)
    // For now, redirect to Shopify admin
    res.redirect(`https://${shop}/admin/apps/${process.env.SHOPIFY_API_KEY}`);
  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).send('Authentication failed');
  }
};
