import Image from 'next/image';
import { Frame } from '../Frame';

export default function Screenshot02() {
  return (
    <Frame bg="linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%)">
      <div style={{ padding: '72px 100px', height: '100%', display: 'flex', alignItems: 'center', gap: '80px' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'inline-flex',
            padding: '6px 14px',
            background: 'rgba(109, 40, 217, 0.12)',
            color: '#6D28D9',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginBottom: '20px',
          }}>
            STEP 2
          </div>
          <h1 style={{
            fontSize: '64px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            marginBottom: '20px',
          }}>
            Photorealistic<br />AI try-on<br />in 60 seconds
          </h1>
          <p style={{ fontSize: '22px', color: '#64748B', lineHeight: 1.5, marginBottom: '28px' }}>
            Customers upload a selfie and instantly see how your product looks on them. Reduces returns and boosts conversion.
          </p>
          <ul style={{ fontSize: '18px', color: '#334155', lineHeight: 1.6, listStyle: 'none', padding: 0 }}>
            <li>✓ Works with clothing, glasses, jewelry, bags, shoes</li>
            <li>✓ No photo storage — processed and deleted instantly</li>
            <li>✓ Powered by Google Gemini AI</li>
          </ul>
        </div>

        <div style={{ flex: 0.7, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(109, 40, 217, 0.25)',
            maxWidth: '480px',
            width: '100%',
          }}>
            <Image
              src="/agalaz-cross-sell.png"
              alt="AI try-on before and after"
              width={800}
              height={1000}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              priority
            />
          </div>
        </div>
      </div>
    </Frame>
  );
}
