"server-only";

import { unstable_cache } from "next/cache";
import { getCourseWithContentBySlug } from "@/services/courses";
import type { CourseWithContent } from "@/types/course";

export function getCachedCourseWithContentBySlug(
  slug: string,
): Promise<CourseWithContent | null> {
  return unstable_cache(
    async () => getCourseWithContentBySlug(slug),
    ["course-with-content", slug],
    { revalidate: 300, tags: [`course:${slug}`] },
  )();
}
