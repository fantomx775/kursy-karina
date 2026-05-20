"server-only";

import { createAdminSupabaseClient } from "@/services/supabase/admin";
import { getSaleWindowsByCourseIds } from "@/services/courseSaleWindows";
import type { Course, CourseSection, CourseWithContent } from "@/types/course";

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  const windowsByCourseId = await getSaleWindowsByCourseIds(admin, [data.id]);

  return {
    ...data,
    sale_windows: windowsByCourseId[data.id] ?? [],
  };
}

export async function getCourseWithContentBySlug(
  slug: string,
): Promise<CourseWithContent | null> {
  const admin = createAdminSupabaseClient();
  const { data: course, error: courseError } = await admin
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (courseError || !course) {
    return null;
  }

  const windowsByCourseId = await getSaleWindowsByCourseIds(admin, [course.id]);

  const { data: sections, error: sectionsError } = await admin
    .from("course_sections")
    .select("id, course_id, title, position")
    .eq("course_id", course.id)
    .order("position", { ascending: true });

  if (sectionsError || !sections) {
    return {
      ...course,
      sale_windows: windowsByCourseId[course.id] ?? [],
      sections: [],
    };
  }

  const sectionIds = sections.map((section) => section.id);

  const { data: items, error: itemsError } = await admin
    .from("course_items")
    .select("*")
    .in("section_id", sectionIds)
    .order("position", { ascending: true });

  if (itemsError || !items) {
    return {
      ...course,
      sale_windows: windowsByCourseId[course.id] ?? [],
      sections: sections.map((s) => ({ ...s, items: [] })),
    };
  }

  const itemsBySection = new Map<string, CourseSection["items"]>();
  items.forEach((item) => {
    const existing = itemsBySection.get(item.section_id) ?? [];
    existing.push(item);
    itemsBySection.set(item.section_id, existing);
  });

  const sectionsWithItems: CourseSection[] = sections.map((section) => ({
    ...section,
    items: itemsBySection.get(section.id) ?? [],
  }));

  return {
    ...course,
    sale_windows: windowsByCourseId[course.id] ?? [],
    sections: sectionsWithItems,
  };
}
