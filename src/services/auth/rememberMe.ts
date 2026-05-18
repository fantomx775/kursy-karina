export const REMEMBER_ME_COOKIE_NAME = "kursy-remember-me";
export const REMEMBER_ME_DISABLED_VALUE = "false";

type CookieOptionsWithLifetime = {
  maxAge?: number;
  expires?: Date;
  [key: string]: unknown;
};

export function isRememberMeDisabled(value: string | null | undefined) {
  return value === REMEMBER_ME_DISABLED_VALUE;
}

export function applyRememberMeToCookieOptions<
  TOptions extends CookieOptionsWithLifetime | undefined,
>(options: TOptions, rememberMeDisabled: boolean): TOptions {
  if (!rememberMeDisabled || !options || options.maxAge === 0) {
    return options;
  }

  const sessionCookieOptions = { ...options };
  delete sessionCookieOptions.maxAge;
  delete sessionCookieOptions.expires;

  return sessionCookieOptions as TOptions;
}

export function setRememberMePreference(rememberMe: boolean) {
  if (typeof document === "undefined") return;

  const encodedName = encodeURIComponent(REMEMBER_ME_COOKIE_NAME);

  if (rememberMe) {
    document.cookie = `${encodedName}=; Max-Age=0; Path=/; SameSite=Lax`;
    return;
  }

  document.cookie = `${encodedName}=${encodeURIComponent(
    REMEMBER_ME_DISABLED_VALUE,
  )}; Path=/; SameSite=Lax`;
}

export function getBrowserRememberMeDisabled() {
  if (typeof document === "undefined") return false;

  return document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .some((cookie) => {
      const [name, ...valueParts] = cookie.split("=");
      return (
        decodeURIComponent(name) === REMEMBER_ME_COOKIE_NAME &&
        isRememberMeDisabled(decodeURIComponent(valueParts.join("=")))
      );
    });
}
