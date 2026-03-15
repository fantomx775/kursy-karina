import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[var(--coffee-cream)] flex items-center justify-center page-width">
      <div className="bg-white border border-[var(--coffee-cappuccino)] p-8 text-center max-w-md">
        <h1 className="text-2xl font-semibold text-[var(--coffee-charcoal)] mb-2">
          Nie znaleziono strony
        </h1>
        <p className="text-[var(--coffee-espresso)] mb-4">
          Przepraszamy, ale taka strona nie istnieje.
        </p>
        <Link
          href="/"
          className="inline-block bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white px-4 py-2"
        >
          Wróć na stronę główną
        </Link>
      </div>
    </div>
  );
}
