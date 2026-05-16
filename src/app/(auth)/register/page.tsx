"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/services/supabase/browser";
import { useAuth } from "@/features/auth/AuthContext";
import { Input, PasswordInput } from "@/components/ui";

type RegisterFieldErrors = Partial<
  Record<
    "firstName" | "lastName" | "email" | "password" | "confirmPassword",
    string
  >
>;

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setSuccess("");

    const nextErrors: RegisterFieldErrors = {};
    if (!firstName.trim()) {
      nextErrors.firstName = "Podaj imię.";
    }

    if (!lastName.trim()) {
      nextErrors.lastName = "Podaj nazwisko.";
    }

    if (!email.trim()) {
      nextErrors.email = "Podaj email.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = "Podaj poprawny adres email.";
    }

    if (password.length < 6) {
      nextErrors.password = "Hasło musi mieć co najmniej 6 znaków.";
    }

    if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Hasła nie są identyczne.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    const fullName = [firstName.trim(), lastName.trim()]
      .filter(Boolean)
      .join(" ");
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    setSuccess("Konto utworzone. Przekierowanie do panelu...");
    setIsSubmitting(false);
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  return (
    <div className="bg-white shadow-md border border-[var(--coffee-cappuccino)] p-8">
      <h1 className="text-2xl font-bold text-[var(--coffee-charcoal)] mb-2 text-center">
        Rejestracja
      </h1>
      <p className="text-sm text-[var(--coffee-espresso)] text-center mb-6">
        Załóż konto, aby kupować i śledzić kursy.
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

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Imię"
            type="text"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setFieldErrors((previous) => ({
                ...previous,
                firstName: undefined,
              }));
            }}
            error={fieldErrors.firstName}
            required
            className="border-radius"
          />
          <Input
            label="Nazwisko"
            type="text"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setFieldErrors((previous) => ({
                ...previous,
                lastName: undefined,
              }));
            }}
            error={fieldErrors.lastName}
            required
            className="border-radius"
          />
        </div>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldErrors((previous) => ({ ...previous, email: undefined }));
          }}
          error={fieldErrors.email}
          required
        />
        <PasswordInput
          label="Hasło"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setFieldErrors((previous) => ({
              ...previous,
              password: undefined,
            }));
          }}
          error={fieldErrors.password}
          required
        />
        <PasswordInput
          label="Powtórz hasło"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setFieldErrors((previous) => ({
              ...previous,
              confirmPassword: undefined,
            }));
          }}
          error={fieldErrors.confirmPassword}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white py-2 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Rejestrowanie..." : "Zarejestruj się"}
        </button>
      </form>

      <div className="mt-4 text-sm text-center text-[var(--coffee-espresso)]">
        Masz już konto?{" "}
        <Link
          href="/login"
          className="text-[var(--coffee-mocha)] hover:underline"
        >
          Zaloguj się
        </Link>
      </div>
    </div>
  );
}
