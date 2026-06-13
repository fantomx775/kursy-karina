"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { useCart } from "@/features/cart/CartContext";
import { Spinner } from "@/components/ui/Spinner";
import { SuccessIcon, ErrorIcon } from "@/components/ui/Icon";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      setMessage("Brak identyfikatora płatności.");
      return;
    }

    if (isLoading) {
      return;
    }

    if (!user) {
      setStatus("error");
      setMessage("Zaloguj się, aby potwierdzić zakup.");
      return;
    }

    if (verificationAttempted.current) {
      return;
    }

    verificationAttempted.current = true;

    const verifyPayment = async () => {
      const response = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();
      if (!response.ok || !data.verified) {
        setStatus("error");
        setMessage(data.error ?? "Nie udało się zweryfikować płatności.");
        return;
      }

      clearCart();
      setStatus("success");
      if (data.invoice?.status === "failed") {
        setMessage(
          "Płatność potwierdzona. Zamówienie jest zapisane, ale faktura wymaga ręcznego sprawdzenia.",
        );
        return;
      }

      if (data.invoice?.status === "issued") {
        setMessage(
          "Płatność potwierdzona. Zamówienie jest zapisane, a faktura zostanie wysłana e-mailem.",
        );
        return;
      }

      setMessage("Płatność potwierdzona. Zamówienie jest zapisane.");
    };

    verifyPayment();
  }, [searchParams, user, isLoading, clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--coffee-cream)] to-[var(--coffee-latte)] flex items-center justify-center page-width">
      <div className="border-radius bg-white border border-[var(--coffee-cappuccino)] p-8 text-center max-w-md w-full shadow-[var(--shadow-md)]">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-[var(--coffee-espresso)]">
              Weryfikacja płatności...
            </p>
          </div>
        )}
        {status === "success" && (
          <div className="flex flex-col items-center">
            <SuccessIcon
              className="mb-6 block h-14 w-14 shrink-0 text-[var(--coffee-charcoal)]"
              size="xl"
              color="var(--coffee-charcoal)"
              aria-hidden
            />
            <h1 className="text-2xl font-semibold text-[var(--coffee-charcoal)] tracking-tight mb-3">
              Sukces!!
            </h1>
            <p className="text-[var(--coffee-espresso)] text-[15px] leading-relaxed mb-8 max-w-[280px] text-center">
              {message}
            </p>
            <Link
              href="/dashboard"
              className="border-radius inline-block bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white px-6 py-2.5 text-sm font-medium transition-colors"
            >
              Przejdź do kursów
            </Link>
          </div>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center">
            <ErrorIcon
              className="mb-4 block h-12 w-12 shrink-0"
              size="xl"
              color="var(--error)"
              aria-hidden
            />
            <h1 className="text-2xl font-semibold text-[var(--coffee-charcoal)] mb-2">
              Wystąpił problem
            </h1>
            <p className="text-[var(--coffee-espresso)] mb-6 text-center">{message}</p>
            <div className="w-full space-y-2">
              <Link
                href="/cart"
                className="border-radius block bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white px-4 py-2"
              >
                Wróć do koszyka
              </Link>
              <Link
                href="/"
                className="border-radius block border border-[var(--coffee-mocha)] text-[var(--coffee-mocha)] px-4 py-2"
              >
                Strona główna
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
