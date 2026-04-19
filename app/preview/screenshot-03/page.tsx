import { Frame } from '../Frame';

export default function Screenshot03() {
  return (
    <Frame bg="linear-gradient(135deg, #0F172A 0%, #1E293B 100%)">
      <div style={{ padding: '72px 100px', height: '100%', display: 'flex', flexDirection: 'column', color: 'white' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '6px 14px',
            background: 'rgba(167, 139, 250, 0.15)',
            color: '#C4B5FD',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginBottom: '20px',
          }}>
            STEP 3
          </div>
          <h1 style={{
            fontSize: '64px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            marginBottom: '12px',
          }}>
            One try-on. <span style={{ color: '#C4B5FD' }}>Two sales.</span>
          </h1>
          <p style={{ fontSize: '22px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, maxWidth: '900px' }}>
            After every try-on, Agalaz recommends matching products from other categories — and lets customers add to cart in one click.
          </p>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignContent: 'start' }}>
          {[
            { from: 'Shirt', to: 'Pants', emoji: '👕 → 👖', desc: 'Matching bottoms by color & style' },
            { from: 'Ring', to: 'Earrings', emoji: '💍 → 👂', desc: 'Complete the jewelry set' },
            { from: 'Dress', to: 'Bag', emoji: '👗 → 👜', desc: 'Outfit-level recommendations' },
          ].map((rec, i) => (
            <div key={i} style={{
              padding: '32px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>{rec.emoji}</div>
              <div style={{ fontSize: '14px', color: '#C4B5FD', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '4px' }}>
                {rec.from.toUpperCase()} → {rec.to.toUpperCase()}
              </div>
              <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                {rec.desc}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '32px',
          padding: '20px 28px',
          background: 'rgba(196, 181, 253, 0.1)',
          border: '1px solid rgba(196, 181, 253, 0.2)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <span style={{ fontSize: '24px' }}>✨</span>
          <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)' }}>
            AI picks by style, color and category — only recommends products that exist in your catalog.
          </span>
        </div>
      </div>
    </Frame>
  );
}
