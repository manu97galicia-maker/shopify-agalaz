const crypto = require('crypto');

function verifyProxy(query) {
  const { signature, ...params } = query;
  if (!signature) return false;

  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('');
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
    .update(sorted)
    .digest('hex');

  return hash === signature;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify Shopify proxy signature
  if (!verifyProxy(req.query)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { faceImage, bodyImage, clothingImage } = req.body;

    // Call Agalaz API
    const response = await fetch(`${process.env.AGALAZ_API_URL}/tryon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AGALAZ_API_SECRET}`,
      },
      body: JSON.stringify({ faceImage, bodyImage, clothingImage }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.json({
      success: true,
      image: data.image,
    });
  } catch (error) {
    console.error('Proxy generate error:', error);
    return res.status(500).json({ error: 'Generation failed' });
  }
};
