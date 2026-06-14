import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCachedCourseWithContentBySlug } from "@/services/coursesCache";
import { CourseDescription } from "@/features/courses/CourseDescription";
import {
  CourseAccessPurchasePanel,
  CourseContentWithAccess,
} from "@/features/courses/CourseDetailAccess";
import { Spinner } from "@/components/ui/Spinner";

export const revalidate = 300;

function AccessSectionFallback() {
  return (
    <div
      className="flex min-h-[12rem] items-center justify-center rounded border border-[var(--coffee-cappuccino)] bg-white p-6"
      role="status"
      aria-label="Ładowanie"
    >
      <Spinner size="md" />
    </div>
  );
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCachedCourseWithContentBySlug(slug);
  if (!course || course.status !== "active") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--coffee-cream)] to-white py-10 sm:py-14 lg:py-20">
      <div className="page-width">
        <nav className="text-sm text-[var(--coffee-espresso)] mb-4 sm:mb-6">
          <Link href="/courses" className="hover:underline active:opacity-70 transition-opacity duration-150">
            Kursy
          </Link>{" "}
          / {course.title}
        </nav>

        <h1 className="hidden lg:block text-2xl sm:text-3xl lg:text-4xl font-semibold text-[var(--coffee-charcoal)] mb-5 sm:mb-6">
          {course.title}
        </h1>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          <div className="space-y-5 sm:space-y-6">
            {course.main_image_url ? (
              <div className="relative w-full max-w-xl aspect-[640/905] overflow-hidden bg-white border border-[var(--coffee-cappuccino)]">
                <Image
                  src={course.main_image_url}
                  alt={course.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, 36rem"
                />
              </div>
            ) : null}

            <Suspense fallback={<AccessSectionFallback />}>
              <CourseAccessPurchasePanel course={course} variant="mobile" />
            </Suspense>

            <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--coffee-charcoal)] lg:hidden">
              {course.title}
            </h1>

            <CourseDescription description={course.description} />

            <Suspense fallback={<AccessSectionFallback />}>
              <CourseContentWithAccess course={course} />
            </Suspense>
          </div>

          <Suspense fallback={<AccessSectionFallback />}>
            <CourseAccessPurchasePanel course={course} variant="desktop" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
