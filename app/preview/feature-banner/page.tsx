import Image from 'next/image';
import { Frame } from '../Frame';

export default function FeatureBanner() {
  return (
    <Frame bg="#0B0B1E">
      {/* radial glow layers */}
      <div style={{
        position: 'absolute',
        top: '-200px',
        left: '-200px',
        width: '900px',
        height: '900px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-250px',
        right: '-200px',
        width: '900px',
        height: '900px',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '45%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        pointerEvents: 'none',
      }} />

      {/* content */}
      <div style={{
        position: 'absolute',
        inset: 0,
        padding: '80px 96px',
        display: 'flex',
        alignItems: 'center',
        gap: '80px',
        zIndex: 1,
      }}>
        {/* LEFT COLUMN */}
        <div style={{ flex: '1 1 55%', maxWidth: '720px' }}>
          {/* Shopify badge row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 18px',
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '999px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 12px #10B981',
              }} />
              <span style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.06em',
              }}>
                SHOPIFY APP · AI-POWERED
              </span>
            </div>
          </div>

          <h1 style={{
            fontSize: '96px',
            lineHeight: 0.98,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.035em',
            marginBottom: '32px',
            fontFamily: '-apple-system, "SF Pro Display", system-ui, sans-serif',
          }}>
            Virtual<br />
            try-on that<br />
            <span style={{
              background: 'linear-gradient(135deg, #A78BFA 0%, #F0ABFC 60%, #FBCFE8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              sells outfits.
            </span>
          </h1>

          <p style={{
            fontSize: '22px',
            lineHeight: 1.45,
            color: 'rgba(255,255,255,0.65)',
            maxWidth: '560px',
            marginBottom: '44px',
            fontWeight: 400,
          }}>
            Customers try on your products with AI in 60 seconds. Then Agalaz recommends a matching item from your catalog — and they add both to cart in one click.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '44px' }}>
            {[
              { emoji: '✨', label: '60-second AI renders' },
              { emoji: '🛍️', label: 'Smart cross-sell' },
              { emoji: '🔒', label: 'Photos never stored' },
              { emoji: '⚡', label: 'Zero code setup' },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 600,
              }}>
                <span style={{ fontSize: '16px' }}>{f.emoji}</span>
                {f.label}
              </div>
            ))}
          </div>

          {/* Install CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '18px 36px',
              background: 'white',
              color: '#0B0B1E',
              borderRadius: '14px',
              fontSize: '17px',
              fontWeight: 800,
              boxShadow: '0 20px 60px rgba(167, 139, 250, 0.35)',
            }}>
              Install on Shopify
              <span style={{ fontSize: '20px' }}>→</span>
            </div>
            <div>
              <div style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>7-day free trial</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px' }}>50 renders · cancel anytime</div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{
          flex: '1 1 45%',
          position: 'relative',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Back card — floating stats */}
          <div style={{
            position: 'absolute',
            top: '60px',
            right: '20px',
            padding: '20px 24px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            zIndex: 2,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '4px' }}>
              AVERAGE ORDER VALUE
            </div>
            <div style={{ color: 'white', fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>
              +38%
            </div>
            <div style={{ color: '#86EFAC', fontSize: '12px', fontWeight: 600, marginTop: '6px' }}>
              ↑ with cross-sell enabled
            </div>
          </div>

          {/* Main product mockup */}
          <div style={{
            position: 'relative',
            width: '560px',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 50px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
            transform: 'perspective(1200px) rotateY(-8deg) rotateX(2deg) rotate(-2deg)',
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

          {/* Front card — notification */}
          <div style={{
            position: 'absolute',
            bottom: '80px',
            left: '-10px',
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.97)',
            borderRadius: '14px',
            zIndex: 3,
            boxShadow: '0 30px 60px rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '280px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366F1, #A855F7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}>
              ✨
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#0B0B1E', fontSize: '13px', fontWeight: 800, marginBottom: '2px' }}>
                Try-on completed
              </div>
              <div style={{ color: '#64748B', fontSize: '11px', fontWeight: 500 }}>
                Matching pants suggested
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom brand line */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        left: '96px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 2,
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #6366F1, #A855F7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 900,
          color: 'white',
        }}>
          A
        </div>
        <span style={{ color: 'white', fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em' }}>
          Agalaz
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: 600, marginLeft: '8px' }}>
          agalaz-virtual-tryon.vercel.app
        </span>
      </div>
    </Frame>
  );
}
