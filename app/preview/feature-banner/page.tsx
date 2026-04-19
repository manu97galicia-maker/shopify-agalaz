import Image from 'next/image';
import { Frame } from '../Frame';

export default function FeatureBanner() {
  return (
    <Frame bg="linear-gradient(135deg, #0F172A 0%, #4338CA 60%, #6D28D9 100%)">
      <div style={{ position: 'absolute', inset: 0, padding: '80px 100px', display: 'flex', alignItems: 'center', gap: '60px' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '999px',
            marginBottom: '28px',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <span style={{ color: '#A5B4FC', fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em' }}>
              ✨ AGALAZ · SHOPIFY APP
            </span>
          </div>

          <h1 style={{
            fontSize: '84px',
            lineHeight: 1.05,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.02em',
            marginBottom: '24px',
          }}>
            Let customers<br />
            <span style={{ color: '#C4B5FD' }}>try on before</span><br />
            they buy.
          </h1>

          <p style={{ fontSize: '22px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, maxWidth: '560px', marginBottom: '40px' }}>
            AI-powered virtual try-on for Shopify. Photorealistic results in 60 seconds. Smart cross-sell after every render.
          </p>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
              padding: '16px 32px',
              background: 'white',
              color: '#0F172A',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 800,
            }}>
              Install on Shopify →
            </div>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
              7-day free trial · No code
            </span>
          </div>
        </div>

        <div style={{ flex: 0.9, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
            maxWidth: '600px',
            width: '100%',
            transform: 'rotate(2deg)',
          }}>
            <Image
              src="/agalaz-hero.png"
              alt="Agalaz product page"
              width={1200}
              height={720}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              priority
            />
          </div>
        </div>
      </div>
    </Frame>
  );
}
