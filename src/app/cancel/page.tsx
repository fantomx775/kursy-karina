import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--coffee-cream)] to-[var(--coffee-latte)] flex items-center justify-center page-width">
      <div className="bg-white border border-[var(--coffee-cappuccino)] p-8 text-center max-w-md w-full">
        <h1 className="text-2xl font-semibold text-[var(--coffee-charcoal)] mb-2">
          Płatność anulowana
        </h1>
        <p className="text-[var(--coffee-espresso)] mb-6">
          Twoja płatność została anulowana. Możesz wrócić do koszyka i spróbować
          ponownie.
        </p>
        <div className="space-y-2">
          <Link
            href="/cart"
            className="block bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white px-4 py-2"
          >
            Wróć do koszyka
          </Link>
          <Link
            href="/"
            className="block border border-[var(--coffee-mocha)] text-[var(--coffee-mocha)] px-4 py-2"
          >
            Strona główna
          </Link>
        </div>
      </div>
    </div>
  );
}
