"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/services/supabase/browser";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const bootstrapSession = async () => {
      const code = searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      const { data } = await supabase.auth.getSession();
      setSessionReady(Boolean(data.session));
    };

    bootstrapSession();
  }, [searchParams, supabase]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne.");
      return;
    }

    setIsSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    setSuccess("Hasło zostało zaktualizowane. Możesz się zalogować.");
    setIsSubmitting(false);
  };

  if (!sessionReady) {
    return (
      <div className="bg-white shadow-md border border-[var(--coffee-cappuccino)] p-8 text-center text-[var(--coffee-espresso)]">
        Ładowanie...
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md border border-[var(--coffee-cappuccino)] p-8">
      <h1 className="text-2xl font-bold text-[var(--coffee-charcoal)] mb-2 text-center">
        Ustaw nowe hasło
      </h1>
      <p className="text-sm text-[var(--coffee-espresso)] text-center mb-6">
        Wprowadź nowe hasło, aby odzyskać dostęp.
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
        <PasswordInput
          label="Nowe hasło"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <PasswordInput
          label="Powtórz hasło"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white py-2 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Aktualizowanie..." : "Zapisz hasło"}
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
