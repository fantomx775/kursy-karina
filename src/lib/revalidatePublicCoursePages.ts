import { revalidatePath, revalidateTag } from "next/cache";

export function revalidatePublicCoursePages(slug: string, previousSlug?: string) {
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath(`/courses/${slug}`);
  revalidateTag(`course:${slug}`, { expire: 0 });

  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/courses/${previousSlug}`);
    revalidateTag(`course:${previousSlug}`, { expire: 0 });
  }
}
