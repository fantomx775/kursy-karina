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
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
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
      setMessage("Płatność potwierdzona. Kurs jest dostępny w panelu.");
    };

    verifyPayment();
  }, [searchParams, user, isLoading, clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--coffee-cream)] to-[var(--coffee-latte)] flex items-center justify-center page-width">
      <div className="border-radius bg-white border border-[var(--coffee-cappuccino)] p-8 text-center max-w-md w-full shadow-[var(--shadow-md)]">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-[var(--coffee-espresso)]">Weryfikacja płatności...</p>
          </div>
        )}
        {status === "success" && (
          <>
            <div className="mb-6 flex justify-center">
              <SuccessIcon
                className="h-14 w-14 text-[var(--coffee-charcoal)]"
                size="xl"
                color="var(--coffee-charcoal)"
                aria-hidden
              />
            </div>
            <h1 className="text-2xl font-semibold text-[var(--coffee-charcoal)] tracking-tight mb-3">
              Sukces!!
            </h1>
            <p className="text-[var(--coffee-espresso)] text-[15px] leading-relaxed mb-8 max-w-[280px] mx-auto">
              {message}
            </p>
            <Link
              href="/dashboard"
              className="border-radius inline-block bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white px-6 py-2.5 text-sm font-medium transition-colors"
            >
              Przejdź do kursów
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mb-4 flex justify-center">
              <ErrorIcon
                className="h-12 w-12"
                size="xl"
                color="var(--error)"
                aria-hidden
              />
            </div>
            <h1 className="text-2xl font-semibold text-[var(--coffee-charcoal)] mb-2">
              Wystąpił problem
            </h1>
            <p className="text-[var(--coffee-espresso)] mb-6">{message}</p>
            <div className="space-y-2">
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
          </>
        )}
      </div>
    </div>
  );
}
