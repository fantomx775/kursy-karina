"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/services/supabase/browser";
import { useAuth } from "@/features/auth/AuthContext";
import { BlockingSpinner, Input, PasswordInput } from "@/components/ui";
import { buildAuthPath, getSafeRedirectPath } from "@/lib/authRedirect";

type RegisterFieldErrors = Partial<
  Record<
    | "firstName"
    | "lastName"
    | "instagramUsername"
    | "email"
    | "password"
    | "confirmPassword",
    string
  >
>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const intent = searchParams.get("intent");
  const redirectPath = getSafeRedirectPath(nextParam);
  const showPurchaseBanner =
    intent === "purchase" || redirectPath === "/cart";
  const { user, isLoading } = useAuth();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginHref = buildAuthPath("/login", {
    next: nextParam ?? undefined,
    intent: intent ?? undefined,
  });

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(redirectPath);
    }
  }, [isLoading, user, router, redirectPath]);

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

    if (!instagramUsername.trim()) {
      nextErrors.instagramUsername = "Podaj nazwę użytkownika na Instagramie.";
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
    const normalizedInstagramUsername = instagramUsername.trim();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          instagram_username: normalizedInstagramUsername,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    const successMessage =
      redirectPath === "/cart"
        ? "Konto utworzone. Wracasz do koszyka..."
        : "Konto utworzone. Przekierowanie...";
    setSuccess(successMessage);
    setIsSubmitting(false);
    setTimeout(() => router.push(redirectPath), 1500);
  };

  return (
    <div className="bg-white shadow-md border border-[var(--coffee-cappuccino)] p-8">
      <BlockingSpinner show={isSubmitting} message="Tworzenie konta..." />
      <h1 className="text-2xl font-bold text-[var(--coffee-charcoal)] mb-2 text-center">
        Rejestracja
      </h1>
      <p className="text-sm text-[var(--coffee-espresso)] text-center mb-6">
        Załóż konto, aby kupować i śledzić kursy.
      </p>

      {showPurchaseBanner ? (
        <div className="bg-[var(--coffee-latte)] border border-[var(--coffee-cappuccino)] text-[var(--coffee-charcoal)] px-3 py-2 mb-4 text-sm">
          <strong>Aby kupić kurs, załóż konto.</strong> Po rejestracji wrócisz
          do koszyka i dokończysz płatność.
        </div>
      ) : null}

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
          label="Nazwa użytkownika na Instagramie"
          type="text"
          value={instagramUsername}
          onChange={(event) => {
            setInstagramUsername(event.target.value);
            setFieldErrors((previous) => ({
              ...previous,
              instagramUsername: undefined,
            }));
          }}
          error={fieldErrors.instagramUsername}
          helperText="To pole jest po to, żebym miała z Tobą kontakt i mogła dodać Cię do grupy na Insta."
          required
        />
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
          className="w-full bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] active:bg-[var(--coffee-dark)] active:scale-[0.98] text-white py-2 transition-all duration-200 disabled:opacity-50"
        >
          {isSubmitting ? "Rejestrowanie..." : "Zarejestruj się"}
        </button>
      </form>

      <div className="mt-4 text-sm text-center text-[var(--coffee-espresso)]">
        Masz już konto?{" "}
        <Link
          href={loginHref}
          className="text-[var(--coffee-mocha)] hover:underline active:opacity-70 transition-opacity duration-150"
        >
          Zaloguj się
        </Link>
      </div>
    </div>
  );
}
