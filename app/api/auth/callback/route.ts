import { NextRequest, NextResponse } from 'next/server';
import { verifyHmac, exchangeToken, isValidShopDomain, verifyOAuthState, OAUTH_NONCE_COOKIE } from '@/lib/shopify';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { generateApiKey } from '@/lib/partners';
import { triggerCatalogSync } from '@/lib/triggerCatalogSync';
import { registerProductWebhooks } from '@/lib/shopifyWebhooks';

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const { shop, code } = params;

  if (!shop || !isValidShopDomain(shop)) {
    return NextResponse.json({ error: 'Invalid shop domain' }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }

  // Verify HMAC
  if (!verifyHmac(params)) {
    return NextResponse.json({ error: 'HMAC verification failed' }, { status: 403 });
  }

  // Verify OAuth state nonce (CSRF protection) — must match cookie set during /api/auth
  const state = params.state || '';
  const expectedNonce = request.cookies.get(OAUTH_NONCE_COOKIE)?.value;
  if (!verifyOAuthState(state, expectedNonce)) {
    return NextResponse.json({ error: 'Invalid OAuth state' }, { status: 403 });
  }

  try {
    // Exchange code for access token
    const accessToken = await exchangeToken(shop, code);

    const admin = createAdminClient();

    // Get shop info from Shopify
    const shopInfoRes = await fetch(`https://${shop}/admin/api/2024-10/shop.json`, {
      headers: { 'X-Shopify-Access-Token': accessToken },
    });
    const shopInfo = shopInfoRes.ok ? (await shopInfoRes.json()).shop : null;
    const shopEmail = shopInfo?.email || '';
    const shopName = shopInfo?.name || shop.replace('.myshopify.com', '');

    // Check if partner already exists for this shop
    const { data: existing } = await admin
      .from('partners')
      .select('id, api_key_hash')
      .eq('shop_domain', shop)
      .single();

    let partnerId: string;
    let isNewInstall = false;

    if (existing) {
      // Update existing partner with new token
      await admin.from('partners').update({
        shopify_access_token: accessToken,
        is_active: true,
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id);
      partnerId = existing.id;
      triggerCatalogSync(partnerId);
      registerProductWebhooks(shop, accessToken).catch(() => {});
    } else {
      // Create new partner record for this Shopify store
      const shopDomain = shop.replace('.myshopify.com', '') + '.myshopify.com';
      const { raw, hash, prefix } = generateApiKey();

      const { data: newPartner, error } = await admin
        .from('partners')
        .insert({
          email: shopEmail,
          store_name: shopName,
          store_url: `https://${shop}`,
          shop_domain: shop,
          shopify_access_token: accessToken,
          api_key_hash: hash,
          api_key_prefix: prefix,
          allowed_domains: [shop, shopDomain],
          plan: 'trial',
          price_eur: 0,
          setup_fee_eur: 0,
          credits_remaining: 0,
          credits_monthly_limit: 0,
          is_active: true,
          setup_paid: true,
        })
        .select('id')
        .single();

      if (error || !newPartner) {
        console.error('Partner creation error:', error);
        return NextResponse.json({ error: 'Failed to register store' }, { status: 500 });
      }

      partnerId = newPartner.id;
      isNewInstall = true;

      triggerCatalogSync(partnerId);
      registerProductWebhooks(shop, accessToken).catch(() => {});

      // Store the API key in a cookie so the dashboard can show it once
      const dashboardUrl = new URL('/dashboard', request.nextUrl.origin);
      dashboardUrl.searchParams.set('shop', shop);
      dashboardUrl.searchParams.set('new', 'true');

      const response = NextResponse.redirect(dashboardUrl);
      response.cookies.set('agalaz_api_key', raw, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 300, // 5 minutes
        path: '/',
      });
      response.cookies.set('agalaz_shop', shop, {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        maxAge: 86400 * 30,
        path: '/',
      });
      response.cookies.delete(OAUTH_NONCE_COOKIE);
      return response;
    }

    // Redirect to dashboard for existing installs
    const dashboardUrl = new URL('/dashboard', request.nextUrl.origin);
    dashboardUrl.searchParams.set('shop', shop);

    const response = NextResponse.redirect(dashboardUrl);
    response.cookies.set('agalaz_shop', shop, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      maxAge: 86400 * 30,
      path: '/',
    });
    response.cookies.delete(OAUTH_NONCE_COOKIE);
    return response;
  } catch (error: any) {
    console.error('Auth callback error:', error?.message);
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
