import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getCourseProgressSaveErrorMessage,
  upsertCourseProgress,
} from "./courseProgress";

const REFRESH_HINT =
  "Odśwież stronę (F5) i spróbuj ponownie — to zwykle przywraca sesję i naprawia zapis.";

describe("getCourseProgressSaveErrorMessage", () => {
  it("returns default Polish message with refresh instruction when error is missing", () => {
    expect(getCourseProgressSaveErrorMessage()).toContain(REFRESH_HINT);
    expect(getCourseProgressSaveErrorMessage(null)).toContain(REFRESH_HINT);
  });

  it("maps JWT and session errors without exposing raw Supabase text", () => {
    const message = getCourseProgressSaveErrorMessage({
      name: "AuthApiError",
      message: "JWT expired",
    });

    expect(message).toContain("Sesja wygasła");
    expect(message).toContain(REFRESH_HINT);
    expect(message).not.toContain("JWT expired");
  });

  it("maps RLS errors to a friendly Polish explanation", () => {
    const message = getCourseProgressSaveErrorMessage({
      name: "PostgrestError",
      message: "new row violates row-level security policy",
      code: "42501",
    } as { name: string; message: string; code: string });

    expect(message).toContain("Brak uprawnień");
    expect(message).toContain(REFRESH_HINT);
    expect(message).not.toContain("row-level security");
  });

  it("maps network errors without passing through English fetch details", () => {
    const message = getCourseProgressSaveErrorMessage({
      name: "TypeError",
      message: "Failed to fetch",
    });

    expect(message).toContain("połączeniem internetowym");
    expect(message).not.toContain("Failed to fetch");
  });

  it("falls back to generic server save message for unknown errors", () => {
    const message = getCourseProgressSaveErrorMessage({
      name: "PostgrestError",
      message: "duplicate key value violates unique constraint",
      code: "23505",
    } as { name: string; message: string; code: string });

    expect(message).toContain("Nie udało się zapisać postępu na serwerze");
    expect(message).toContain(REFRESH_HINT);
    expect(message).not.toContain("duplicate key");
  });
});

describe("upsertCourseProgress", () => {
  it("retries upsert once after refreshing session on failure", async () => {
    const refreshSession = vi
      .fn()
      .mockResolvedValue({ data: { session: null }, error: null });
    const upsert = vi
      .fn()
      .mockResolvedValueOnce({ error: { message: "JWT expired", code: "PGRST301" } })
      .mockResolvedValueOnce({ error: null });

    const from = vi.fn(() => ({ upsert }));
    const supabase = {
      auth: { refreshSession },
      from,
    } as unknown as SupabaseClient;

    const result = await upsertCourseProgress(supabase, {
      userId: "user-1",
      courseId: "course-1",
      itemId: "item-1",
      completed: true,
    });

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledTimes(2);
    expect(from).toHaveBeenCalledWith("course_progress");
    expect(result.error).toBeNull();
  });
});
