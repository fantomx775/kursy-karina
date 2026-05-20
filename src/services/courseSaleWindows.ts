"server-only";

import type { CourseSaleWindow } from "@/types/course";

type SupabaseQueryClient = {
  from: (table: string) => any;
};

export type CourseSaleWindowInput = {
  startsAt: string;
  endsAt: string;
};

export async function getSaleWindowsByCourseIds(
  supabase: SupabaseQueryClient,
  courseIds: string[],
): Promise<Record<string, CourseSaleWindow[]>> {
  const uniqueCourseIds = Array.from(new Set(courseIds));
  if (uniqueCourseIds.length === 0) return {};

  const { data } = await supabase
    .from("course_sale_windows")
    .select("id, course_id, starts_at, ends_at, created_at, updated_at")
    .in("course_id", uniqueCourseIds)
    .order("starts_at", { ascending: true });

  const windowsByCourseId: Record<string, CourseSaleWindow[]> = {};
  ((data ?? []) as CourseSaleWindow[]).forEach((window) => {
    if (!window.course_id) return;
    windowsByCourseId[window.course_id] = [
      ...(windowsByCourseId[window.course_id] ?? []),
      window,
    ];
  });

  return windowsByCourseId;
}

export async function replaceCourseSaleWindows(
  supabase: SupabaseQueryClient,
  courseId: string,
  saleWindows: CourseSaleWindowInput[],
): Promise<{ error: { message: string } | null }> {
  const { error: deleteError } = await supabase
    .from("course_sale_windows")
    .delete()
    .eq("course_id", courseId);

  if (deleteError) {
    return { error: deleteError };
  }

  if (saleWindows.length === 0) {
    return { error: null };
  }

  const { error: insertError } = await supabase
    .from("course_sale_windows")
    .insert(
      saleWindows.map((window) => ({
        course_id: courseId,
        starts_at: window.startsAt,
        ends_at: window.endsAt,
      })),
    );

  return { error: insertError ?? null };
}
