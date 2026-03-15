export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--coffee-cream)] to-[var(--coffee-latte)] flex items-center justify-center page-width py-12">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
