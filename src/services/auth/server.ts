"server-only";

import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { createServerSupabaseClient } from "@/services/supabase/server";
import type { UserProfile } from "@/types/user";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: "admin" | "student";
  profile: UserProfile;
};

export type AuthResult =
  | { success: true; user: AuthenticatedUser }
  | { success: false; error: string; statusCode: number };

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const adminClient = createAdminSupabaseClient();
  const { data, error } = await adminClient
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function authenticateUser(): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized", statusCode: 401 };
  }

  const profile = await getUserProfile(user.id);
  if (!profile) {
    return { success: false, error: "Profile not found", statusCode: 404 };
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email ?? "",
      role: profile.role,
      profile,
    },
  };
}

/**
 * Use at the start of every /api/admin/* route handler.
 * Ensures the request is authenticated and the user has role "admin".
 */
export async function authenticateAdmin(): Promise<AuthResult> {
  const authResult = await authenticateUser();
  if (!authResult.success) return authResult;

  if (authResult.user.role !== "admin") {
    return { success: false, error: "Admin access required", statusCode: 403 };
  }

  return authResult;
}
