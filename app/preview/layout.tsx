export const metadata = {
  title: 'Agalaz — App Store Assets',
  robots: 'noindex, nofollow',
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
      {children}
    </div>
  );
}
