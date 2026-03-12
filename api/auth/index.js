const crypto = require('crypto');

module.exports = (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send('Missing shop parameter');

  const scopes = process.env.SHOPIFY_SCOPES || 'read_products';
  const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/auth/callback`;
  const nonce = crypto.randomBytes(16).toString('hex');

  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${nonce}`;

  res.redirect(authUrl);
};
