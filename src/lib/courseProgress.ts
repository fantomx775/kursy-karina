import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

const BASE_MESSAGE = "Nie udało się zapisać postępu na serwerze.";
const REFRESH_INSTRUCTION =
  "Odśwież stronę (F5) i spróbuj ponownie — to zwykle przywraca sesję i naprawia zapis.";

export function getCourseProgressSaveErrorMessage(
  error?: Error | PostgrestError | null,
): string {
  if (!error) {
    return `${BASE_MESSAGE} ${REFRESH_INSTRUCTION}`;
  }

  const code = "code" in error ? error.code : undefined;
  const message = error.message.toLowerCase();

  if (message.includes("brak zalogowanego")) {
    return `Musisz być zalogowany, aby zapisać postęp. ${REFRESH_INSTRUCTION}`;
  }

  if (
    code === "PGRST301" ||
    message.includes("jwt") ||
    message.includes("session") ||
    message.includes("not authenticated") ||
    message.includes("invalid claim")
  ) {
    return `Sesja wygasła lub wymaga odświeżenia. ${REFRESH_INSTRUCTION}`;
  }

  if (
    code === "42501" ||
    message.includes("row-level security") ||
    message.includes("policy") ||
    message.includes("permission denied")
  ) {
    return `Brak uprawnień do zapisu postępu — często po wygaśnięciu sesji. ${REFRESH_INSTRUCTION}`;
  }

  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("failed to fetch") ||
    error.name === "TypeError"
  ) {
    return `Problem z połączeniem internetowym. Sprawdź sieć, a następnie odśwież stronę (F5) i spróbuj ponownie.`;
  }

  return `${BASE_MESSAGE} ${REFRESH_INSTRUCTION}`;
}

export type UpsertCourseProgressParams = {
  userId: string;
  courseId: string;
  itemId: string;
  completed: boolean;
};

export async function upsertCourseProgress(
  supabase: SupabaseClient,
  params: UpsertCourseProgressParams,
): Promise<{ error: Error | PostgrestError | null }> {
  const row = {
    user_id: params.userId,
    course_id: params.courseId,
    item_id: params.itemId,
    completed: params.completed,
    last_watched: new Date().toISOString(),
  };

  const doUpsert = () =>
    supabase
      .from("course_progress")
      .upsert(row, { onConflict: "user_id,item_id" });

  let { error } = await doUpsert();

  if (error) {
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (!refreshError) {
      const retry = await doUpsert();
      error = retry.error;
    }
  }

  return { error: error ?? null };
}
