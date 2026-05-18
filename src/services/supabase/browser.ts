"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  applyRememberMeToCookieOptions,
  getBrowserRememberMeDisabled,
} from "@/services/auth/rememberMe";

type BrowserCookieOptions = {
  domain?: string;
  expires?: Date;
  maxAge?: number;
  path?: string;
  sameSite?: boolean | "lax" | "strict" | "none";
  secure?: boolean;
};

function parseBrowserCookies() {
  if (typeof document === "undefined" || !document.cookie) return [];

  return document.cookie.split(";").map((cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");
    return {
      name: decodeURIComponent(name),
      value: decodeURIComponent(valueParts.join("=")),
    };
  });
}

function serializeBrowserCookie(
  name: string,
  value: string,
  options: BrowserCookieOptions = {},
) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }
  if (options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }
  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }
  if (options.path) {
    parts.push(`Path=${options.path}`);
  }
  if (options.sameSite) {
    const sameSite =
      typeof options.sameSite === "string" ? options.sameSite : "Strict";
    parts.push(`SameSite=${sameSite}`);
  }
  if (options.secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseBrowserCookies();
        },
        setAll(cookiesToSet) {
          const rememberMeDisabled = getBrowserRememberMeDisabled();

          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = serializeBrowserCookie(
              name,
              value,
              applyRememberMeToCookieOptions(
                options as BrowserCookieOptions,
                rememberMeDisabled,
              ),
            );
          });
        },
      },
    },
  );
}
