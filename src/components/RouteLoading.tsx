import { Spinner } from "@/components/ui/Spinner";

export function RouteLoading({ message = "Ładowanie..." }: { message?: string }) {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-gradient-to-b from-[var(--coffee-cream)] to-white py-16"
      role="status"
      aria-label="Ładowanie"
    >
      <Spinner size="lg" />
      <p className="text-sm text-[var(--coffee-espresso)]">{message}</p>
    </div>
  );
}
