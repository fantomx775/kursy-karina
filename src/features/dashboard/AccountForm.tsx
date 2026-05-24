"use client";

import { FormEvent, useMemo, useState } from "react";
import { Input, PasswordInput, Spinner } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthContext";
import { createBrowserSupabaseClient } from "@/services/supabase/browser";
import type { UserProfile } from "@/types/user";

const MAX_NAME_LENGTH = 100;
const MIN_PASSWORD_LENGTH = 6;

type ProfileFieldErrors = Partial<Record<"firstName" | "lastName", string>>;
type PasswordFieldErrors = Partial<
  Record<"newPassword" | "confirmPassword", string>
>;

type Props = {
  profile: UserProfile;
};

export function AccountForm({ profile }: Props) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const { refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile.first_name);
  const [lastName, setLastName] = useState(profile.last_name);
  const [instagramUsername, setInstagramUsername] = useState(
    profile.instagram_username ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [success, setSuccess] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordFieldErrors, setPasswordFieldErrors] =
    useState<PasswordFieldErrors>({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);
    const f = firstName.trim();
    const l = lastName.trim();
    const nextErrors: ProfileFieldErrors = {};
    if (!f) {
      nextErrors.firstName = "Imię jest wymagane.";
    }
    if (!l) {
      nextErrors.lastName = "Nazwisko jest wymagane.";
    }

    if (f.length > MAX_NAME_LENGTH) {
      nextErrors.firstName = `Imię może mieć co najwyżej ${MAX_NAME_LENGTH} znaków.`;
    }

    if (l.length > MAX_NAME_LENGTH) {
      nextErrors.lastName = `Nazwisko może mieć co najwyżej ${MAX_NAME_LENGTH} znaków.`;
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: f,
          last_name: l,
          instagram_username: instagramUsername.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Zapis nie powiódł się.");
        return;
      }
      await refreshProfile();
      setSuccess(true);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordFieldErrors({});
    setPasswordSuccess(false);
    const nextErrors: PasswordFieldErrors = {};
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      nextErrors.newPassword = `Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`;
    }
    if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Hasła nie są identyczne.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setPasswordFieldErrors(nextErrors);
      return;
    }
    setPasswordSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateError) {
      setPasswordError(updateError.message);
      setPasswordSaving(false);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSuccess(true);
    setPasswordSaving(false);
  };

  return (
    <div className="max-w-md space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Imię"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value);
            setFieldErrors((previous) => ({
              ...previous,
              firstName: undefined,
            }));
          }}
          maxLength={MAX_NAME_LENGTH}
          disabled={saving}
          error={fieldErrors.firstName}
          required
          className="border-radius"
        />
        <Input
          label="Nazwisko"
          value={lastName}
          onChange={(e) => {
            setLastName(e.target.value);
            setFieldErrors((previous) => ({
              ...previous,
              lastName: undefined,
            }));
          }}
          maxLength={MAX_NAME_LENGTH}
          disabled={saving}
          error={fieldErrors.lastName}
          required
          className="border-radius"
        />
        <Input
          label="Email"
          type="email"
          value={profile.email}
          readOnly
          helperText="Skontaktuj się z administratorem w sprawie zmiany adresu email."
          className="border-radius bg-[var(--coffee-latte)] cursor-default"
          aria-readonly="true"
        />
        <Input
          label="Nazwa użytkownika na Instagramie"
          value={instagramUsername}
          onChange={(e) => setInstagramUsername(e.target.value)}
          helperText="Ułatwia kontakt i dodanie Cię do grupy kursowej na Insta."
          className="border-radius"
        />
        {error && (
          <p className="text-sm text-[var(--error)]" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-[var(--success)]" role="status">
            Dane zostały zapisane.
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white px-5 py-2.5 text-sm transition-colors min-h-[44px] border-radius disabled:opacity-70"
        >
          {saving ? (
            <>
              <Spinner size="sm" className="shrink-0" />
              Zapisywanie…
            </>
          ) : (
            "Zapisz"
          )}
        </button>
      </form>

      <div className="pt-6 border-t border-[var(--coffee-cappuccino)]">
        <h3 className="text-base font-semibold text-[var(--coffee-charcoal)] mb-4">
          Zmiana hasła
        </h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
          <PasswordInput
            label="Nowe hasło"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setPasswordFieldErrors((previous) => ({
                ...previous,
                newPassword: undefined,
              }));
            }}
            minLength={MIN_PASSWORD_LENGTH}
            disabled={passwordSaving}
            error={passwordFieldErrors.newPassword}
            placeholder="••••••••"
            className="border-radius"
          />
          <PasswordInput
            label="Powtórz nowe hasło"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setPasswordFieldErrors((previous) => ({
                ...previous,
                confirmPassword: undefined,
              }));
            }}
            minLength={MIN_PASSWORD_LENGTH}
            disabled={passwordSaving}
            error={passwordFieldErrors.confirmPassword}
            placeholder="••••••••"
            className="border-radius"
          />
          {passwordError && (
            <p className="text-sm text-[var(--error)]" role="alert">
              {passwordError}
            </p>
          )}
          {passwordSuccess && (
            <p className="text-sm text-[var(--success)]" role="status">
              Hasło zostało zmienione.
            </p>
          )}
          <button
            type="submit"
            disabled={passwordSaving || !newPassword || !confirmPassword}
            className="inline-flex items-center gap-2 bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white px-5 py-2.5 text-sm transition-colors min-h-[44px] border-radius disabled:opacity-70"
          >
            {passwordSaving ? (
              <>
                <Spinner size="sm" className="shrink-0" />
                Zapisywanie…
              </>
            ) : (
              "Zmień hasło"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
