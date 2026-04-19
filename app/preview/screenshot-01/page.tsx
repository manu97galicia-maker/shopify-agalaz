import Image from 'next/image';
import { Frame } from '../Frame';

export default function Screenshot01() {
  return (
    <Frame>
      <div style={{ padding: '72px 100px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '6px 14px',
            background: 'rgba(79, 70, 229, 0.1)',
            color: '#4338CA',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginBottom: '20px',
          }}>
            STEP 1
          </div>
          <h1 style={{
            fontSize: '64px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            marginBottom: '12px',
          }}>
            One-click try-on on every product
          </h1>
          <p style={{ fontSize: '22px', color: '#64748B', lineHeight: 1.4, maxWidth: '900px' }}>
            The "Try it with AI" button appears automatically on all your product pages after install. Zero code required.
          </p>
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}>
          <div style={{
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(15, 23, 42, 0.15)',
            border: '1px solid #E2E8F0',
            maxWidth: '900px',
            width: '100%',
          }}>
            <Image
              src="/agalaz-hero.png"
              alt="Product page with try-on button"
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
