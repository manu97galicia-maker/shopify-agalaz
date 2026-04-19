export function Frame({ children, bg }: { children: React.ReactNode; bg?: string }) {
  return (
    <div
      style={{
        width: '1600px',
        height: '900px',
        background: bg || 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
      }}
    >
      {children}
    </div>
  );
}
