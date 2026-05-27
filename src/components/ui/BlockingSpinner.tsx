import { Spinner } from "@/components/ui/Spinner";

type BlockingSpinnerProps = {
  show: boolean;
  message?: string;
};

export function BlockingSpinner({
  show,
  message = "Trwa zapisywanie...",
}: BlockingSpinnerProps) {
  if (!show) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]"
      role="status"
      aria-live="assertive"
      aria-label={message}
    >
      <div className="flex min-w-64 flex-col items-center gap-3 border-radius border border-[var(--coffee-cappuccino)] bg-white px-6 py-5 text-center shadow-xl">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-[var(--coffee-charcoal)]">
          {message}
        </p>
      </div>
    </div>
  );
}
