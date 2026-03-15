"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/services/supabase/browser";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      },
    );

    if (resetError) {
      setError(resetError.message);
      setIsSubmitting(false);
      return;
    }

    setSuccess("Sprawdź skrzynkę email, aby zresetować hasło.");
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white shadow-md border border-[var(--coffee-cappuccino)] p-8">
      <h1 className="text-2xl font-bold text-[var(--coffee-charcoal)] mb-2 text-center">
        Reset hasła
      </h1>
      <p className="text-sm text-[var(--coffee-espresso)] text-center mb-6">
        Podaj email, a wyślemy Ci link do zmiany hasła.
      </p>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 mb-4 text-sm">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 mb-4 text-sm">
          {success}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-[var(--coffee-charcoal)] mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full border border-[var(--coffee-cappuccino)] px-3 py-2 bg-white text-[var(--coffee-charcoal)]"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white py-2 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Wysyłanie..." : "Wyślij link"}
        </button>
      </form>

      <div className="mt-4 text-sm text-center text-[var(--coffee-espresso)]">
        <Link href="/login" className="text-[var(--coffee-mocha)] hover:underline">
          Wróć do logowania
        </Link>
      </div>
    </div>
  );
}
