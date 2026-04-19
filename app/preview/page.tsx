import FeatureBanner from './feature-banner/page';
import Screenshot01 from './screenshot-01/page';
import Screenshot02 from './screenshot-02/page';
import Screenshot03 from './screenshot-03/page';
import Screenshot04 from './screenshot-04/page';

const FRAMES = [
  { id: 'feature-banner', label: 'Feature banner', role: 'App listing header', Component: FeatureBanner },
  { id: 'screenshot-01', label: 'Screenshot 1 — Try-on button', role: 'Product page integration', Component: Screenshot01 },
  { id: 'screenshot-02', label: 'Screenshot 2 — AI result', role: 'Photorealistic try-on', Component: Screenshot02 },
  { id: 'screenshot-03', label: 'Screenshot 3 — Cross-sell', role: 'Smart recommendations', Component: Screenshot03 },
  { id: 'screenshot-04', label: 'Screenshot 4 — Pricing', role: 'Trial & plans', Component: Screenshot04 },
];

export default function PreviewAll() {
  return (
    <div style={{ background: '#0F172A', minHeight: '100vh', padding: '48px 0' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto 40px', padding: '0 24px', color: 'white' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>App Store Assets</h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '16px' }}>
          All 5 frames at exact <strong style={{ color: 'white' }}>1600 × 900 px</strong>. Scroll down and capture each one.
        </p>
        <div style={{
          padding: '16px 20px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          fontSize: '13px',
          color: 'rgba(255,255,255,0.8)',
          lineHeight: 1.7,
        }}>
          <strong style={{ color: 'white' }}>How to capture each frame as PNG:</strong><br />
          Right-click the frame → <em>Inspect</em> → right-click the <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '4px' }}>&lt;div&gt;</code> with <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: '4px' }}>width: 1600px</code> → <em>Capture node screenshot</em>. Chrome saves a PNG at exact 1600×900.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
        {FRAMES.map(({ id, label, role, Component }, i) => (
          <div key={id} id={id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', color: 'white', paddingLeft: '4px' }}>
              <span style={{
                width: '24px',
                height: '24px',
                background: '#4F46E5',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {i + 1}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>{label}</span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>· {role}</span>
            </div>
            <div style={{
              boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <Component />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
