import { createAdminClient } from './supabaseAdmin';
import { createHash, randomBytes } from 'crypto';

// ── API Key format: agz_live_<32 random hex chars> ──

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const secret = randomBytes(16).toString('hex');
  const raw = `agz_live_${secret}`;
  const hash = hashApiKey(raw);
  const prefix = raw.substring(0, 13);
  return { raw, hash, prefix };
}

export function hashApiKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export interface Partner {
  id: string;
  email: string;
  store_name: string;
  store_url: string;
  shop_domain: string;
  api_key_prefix: string;
  allowed_domains: string[];
  plan: string;
  credits_remaining: number;
  credits_monthly_limit: number;
  total_renders: number;
  is_active: boolean;
  attempts_today?: number;
  attempts_reset_date?: string;
}

export async function checkAndBumpAttempts(
  partnerId: string,
  creditsRemaining: number,
  currentAttempts: number,
  resetDate: string | null,
): Promise<{ allowed: boolean; attempts: number; cap: number }> {
  const admin = createAdminClient();
  const today = new Date().toISOString().split('T')[0];
  const isSameDay = resetDate === today;
  const attempts = isSameDay ? (currentAttempts || 0) : 0;

  // Cap = 3x current credits, minimum 10, max 500 (prevents runaway cost)
  const cap = Math.min(500, Math.max(10, creditsRemaining * 3));

  if (attempts >= cap) {
    return { allowed: false, attempts, cap };
  }

  await admin
    .from('partners')
    .update({
      attempts_today: attempts + 1,
      attempts_reset_date: today,
    })
    .eq('id', partnerId);

  return { allowed: true, attempts: attempts + 1, cap };
}

/**
 * Validate an API key and return the partner if valid.
 * Also checks domain allowlist against the request Origin/Referer.
 */
export async function validateApiKey(
  apiKey: string,
  requestOrigin?: string | null
): Promise<{ valid: boolean; partner?: Partner; error?: string }> {
  if (!apiKey || !apiKey.startsWith('agz_live_')) {
    return { valid: false, error: 'Invalid API key format' };
  }

  const hash = hashApiKey(apiKey);
  const admin = createAdminClient();

  const { data: partner, error } = await admin
    .from('partners')
    .select('*')
    .eq('api_key_hash', hash)
    .single();

  if (error || !partner) {
    return { valid: false, error: 'Invalid API key' };
  }

  if (!partner.is_active) {
    return { valid: false, error: 'API key is deactivated' };
  }

  if (partner.credits_remaining <= 0) {
    return { valid: false, error: 'No credits remaining' };
  }

  // Domain validation
  if (partner.allowed_domains.length > 0 && requestOrigin) {
    const originDomain = extractDomain(requestOrigin);
    if (originDomain && !originDomain.endsWith('.agalaz.com') && originDomain !== 'agalaz.com'
        && !originDomain.endsWith('.vercel.app')) {
      const domainAllowed = partner.allowed_domains.some((d: string) =>
        originDomain === d || originDomain.endsWith('.' + d)
      );
      if (!domainAllowed) {
        return { valid: false, error: 'Domain not authorized' };
      }
    }
  }

  return { valid: true, partner };
}

/**
 * Deduct 1 credit and log usage for a partner.
 */
export async function deductPartnerCredit(partnerId: string, currentCredits: number, currentRenders: number) {
  const admin = createAdminClient();

  await admin
    .from('partners')
    .update({
      credits_remaining: currentCredits - 1,
      total_renders: currentRenders + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', partnerId);

  // Upsert daily usage
  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await admin
    .from('partner_usage')
    .select('id, renders_count')
    .eq('partner_id', partnerId)
    .eq('date', today)
    .single();

  if (existing) {
    await admin
      .from('partner_usage')
      .update({ renders_count: existing.renders_count + 1 })
      .eq('id', existing.id);
  } else {
    await admin
      .from('partner_usage')
      .insert({ partner_id: partnerId, date: today, renders_count: 1 });
  }
}

function extractDomain(origin: string): string | null {
  try {
    const url = new URL(origin);
    return url.hostname;
  } catch {
    return origin.replace(/^https?:\/\//, '').split('/')[0].split(':')[0] || null;
  }
}
