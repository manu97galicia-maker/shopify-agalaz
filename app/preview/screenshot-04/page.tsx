import { Frame } from '../Frame';

export default function Screenshot04() {
  return (
    <Frame>
      <div style={{ padding: '72px 100px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '6px 14px',
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#047857',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginBottom: '20px',
          }}>
            STEP 4
          </div>
          <h1 style={{
            fontSize: '64px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            marginBottom: '12px',
          }}>
            Start free. Scale as you grow.
          </h1>
          <p style={{ fontSize: '22px', color: '#64748B', lineHeight: 1.5 }}>
            7-day free trial with 50 renders. Cancel anytime before day 7 for €0.
          </p>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px', alignContent: 'center' }}>
          {[
            {
              name: 'Free Trial',
              price: '€0',
              period: '/ 7 days',
              renders: '50 renders',
              desc: 'Payment method required. Cancel anytime before day 7.',
              popular: false,
              dark: false,
            },
            {
              name: 'Starter',
              price: '€149',
              period: '/ month',
              renders: '200 renders / month',
              desc: 'Boutiques and small stores.',
              popular: true,
              dark: true,
            },
            {
              name: 'Growth',
              price: '€499',
              period: '/ month',
              renders: '1,000 renders / month',
              desc: 'High-volume stores.',
              popular: false,
              dark: false,
            },
          ].map((p, i) => (
            <div key={i} style={{
              padding: '36px 32px',
              background: p.dark ? '#4338CA' : 'white',
              color: p.dark ? 'white' : '#0F172A',
              borderRadius: '24px',
              border: p.dark ? 'none' : '1px solid #E2E8F0',
              boxShadow: p.dark ? '0 20px 40px rgba(67, 56, 202, 0.3)' : '0 8px 24px rgba(15, 23, 42, 0.05)',
              position: 'relative',
              transform: p.popular ? 'scale(1.03)' : 'scale(1)',
            }}>
              {p.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '6px 14px',
                  background: '#FBBF24',
                  color: '#78350F',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{ fontSize: '14px', fontWeight: 800, opacity: p.dark ? 0.7 : 0.5, letterSpacing: '0.08em', marginBottom: '8px' }}>
                {p.name.toUpperCase()}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
                <span style={{ fontSize: '56px', fontWeight: 800, letterSpacing: '-0.03em' }}>{p.price}</span>
                <span style={{ fontSize: '16px', opacity: 0.6 }}>{p.period}</span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: p.dark ? '#C4B5FD' : '#4338CA', marginBottom: '16px' }}>
                {p.renders}
              </div>
              <p style={{ fontSize: '14px', opacity: 0.65, lineHeight: 1.5 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}
