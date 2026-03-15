"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { createBrowserSupabaseClient } from "@/services/supabase/browser";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="bg-white shadow-md border border-[var(--coffee-cappuccino)] p-8">
      <h1 className="text-2xl font-bold text-[var(--coffee-charcoal)] mb-2 text-center">
        Logowanie
      </h1>
      <p className="text-sm text-[var(--coffee-espresso)] text-center mb-6">
        Zaloguj się, aby kontynuować naukę.
      </p>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 mb-4 text-sm">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm text-[var(--coffee-charcoal)] mb-1"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            className="w-full border border-[var(--coffee-cappuccino)] px-3 py-2 bg-white text-[var(--coffee-charcoal)]"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <PasswordInput
          label="Hasło"
          id="login-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white py-2 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Logowanie..." : "Zaloguj się"}
        </button>
      </form>

      <div className="mt-4 text-sm text-center text-[var(--coffee-espresso)]">
        <Link href="/forgot-password" className="hover:underline">
          Nie pamiętasz hasła?
        </Link>
      </div>
      <div className="mt-2 text-sm text-center text-[var(--coffee-espresso)]">
        Nie masz konta?{" "}
        <Link href="/register" className="text-[var(--coffee-mocha)] hover:underline">
          Zarejestruj się
        </Link>
      </div>
    </div>
  );
}
