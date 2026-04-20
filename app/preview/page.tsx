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
