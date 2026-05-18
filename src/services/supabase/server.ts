"server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  REMEMBER_ME_COOKIE_NAME,
  applyRememberMeToCookieOptions,
  isRememberMeDisabled,
} from "@/services/auth/rememberMe";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const rememberMeDisabled = isRememberMeDisabled(
    cookieStore.get(REMEMBER_ME_COOKIE_NAME)?.value,
  );

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(
                name,
                value,
                applyRememberMeToCookieOptions(options, rememberMeDisabled),
              ),
            );
          } catch {
            // Called from a Server Component; refresh via middleware.
          }
        },
      },
    },
  );
}
