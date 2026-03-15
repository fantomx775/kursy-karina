import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import type { UserProfile } from "@/types/user";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminSupabaseClient();
  const { data: profile, error: profileError } = await admin
    .from("users")
    .select("id, email, first_name, last_name, role, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: profile as UserProfile,
  });
}

function isValidPatchBody(
  body: unknown
): body is { first_name?: string; last_name?: string } {
  if (typeof body !== "object" || body === null) return false;
  const o = body as Record<string, unknown>;
  if (o.first_name !== undefined && typeof o.first_name !== "string") return false;
  if (o.last_name !== undefined && typeof o.last_name !== "string") return false;
  return true;
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isValidPatchBody(body)) {
    return NextResponse.json(
      { error: "Body must contain optional first_name and/or last_name (strings)" },
      { status: 400 }
    );
  }

  const updates: { first_name?: string; last_name?: string } = {};
  if (body.first_name !== undefined) {
    const trimmed = body.first_name.trim();
    if (!trimmed) {
      return NextResponse.json(
        { error: "first_name cannot be empty" },
        { status: 400 }
      );
    }
    updates.first_name = trimmed;
  }
  if (body.last_name !== undefined) {
    const trimmed = body.last_name.trim();
    if (!trimmed) {
      return NextResponse.json(
        { error: "last_name cannot be empty" },
        { status: 400 }
      );
    }
    updates.last_name = trimmed;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Provide at least one of first_name, last_name" },
      { status: 400 }
    );
  }

  const { data: profile, error: updateError } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id)
    .select("id, email, first_name, last_name, role, created_at, updated_at")
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message ?? "Update failed" },
      { status: 500 }
    );
  }

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: profile as UserProfile,
  });
}
