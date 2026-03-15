import Link from "next/link";
import Image from "next/image";
import { createAdminSupabaseClient } from "@/services/supabase/admin";
import type { Course } from "@/types/course";
import { isPromoActive, getEffectivePriceCents, getPromoLabel } from "@/lib/coursePromo";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const admin = createAdminSupabaseClient();
  const { data: courses } = await admin
    .from("courses")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--coffee-cream)] to-white py-10 sm:py-14 lg:py-20">
      <div className="page-width">
        <div className="mb-8 sm:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[var(--coffee-charcoal)] mb-3">
            Kursy online
          </h1>
          <p className="text-[var(--coffee-espresso)] text-base sm:text-lg max-w-xl mx-auto">
            Wybierz szkolenie dopasowane do Twoich potrzeb i rozpocznij naukę.
          </p>
        </div>

        {courses && courses.length > 0 ? (
          <div className="grid gap-5 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {(courses as Course[]).map((course) => {
              const promoActive = isPromoActive(course);
              const effectiveCents = getEffectivePriceCents(course);
              const promoLabel = getPromoLabel(course);
              const hasStrikethrough =
                promoActive && course.price !== effectiveCents;
              return (
                <div
                  key={course.id}
                  className="bg-white border border-[var(--coffee-cappuccino)] shadow-sm overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-[var(--shadow-lg)] border-radius"
                >
                  <Link href={`/courses/${course.slug}`} className="block relative h-48 sm:h-52 flex-shrink-0">
                    <div className="absolute inset-0 bg-[var(--coffee-cappuccino)] flex items-center justify-center overflow-hidden">
                      {course.main_image_url ? (
                        <Image
                          src={course.main_image_url}
                          alt={course.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <span className="text-[var(--coffee-espresso)] text-lg">Kurs Image</span>
                      )}
                    </div>
                    {promoActive && (
                      <div className="absolute top-2 right-2 flex flex-row flex-wrap gap-1.5 items-center">
                        <span className="bg-[var(--coffee-mocha)] text-white px-2 py-0.5 text-xs font-semibold tracking-wider uppercase">
                          PROMOCJA
                        </span>
                        {promoLabel && (
                          <span className="bg-[var(--coffee-mocha)] text-white px-2 py-0.5 text-xs font-semibold">
                            {promoLabel}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="text-lg sm:text-xl font-semibold text-[var(--coffee-charcoal)] leading-tight">
                      {course.title}
                    </h2>
                    {promoActive && (
                      <span className="shrink-0 flex flex-row flex-wrap gap-1.5 items-center">
                        <span className="bg-[var(--coffee-mocha)] text-white px-2 py-0.5 text-xs font-semibold tracking-wider uppercase">
                          PROMOCJA
                        </span>
                        {promoLabel && (
                          <span className="bg-[var(--coffee-mocha)] text-white px-2 py-0.5 text-xs font-semibold">
                            {promoLabel}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--coffee-espresso)] flex-1 leading-relaxed">
                    {course.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-[var(--coffee-cappuccino)] flex items-center justify-between gap-3">
                    <span className="text-lg sm:text-xl font-semibold text-[var(--coffee-charcoal)] whitespace-nowrap flex flex-wrap items-baseline gap-2">
                      {hasStrikethrough && (
                        <span className="line-through text-base font-normal text-[var(--coffee-espresso)]">
                          {(course.price / 100).toFixed(2)} PLN
                        </span>
                      )}
                      {(effectiveCents / 100).toFixed(2)} PLN
                    </span>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white px-4 py-2.5 text-sm transition-colors min-h-[44px] flex items-center whitespace-nowrap border-radius"
                    >
                      Zobacz kurs
                    </Link>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-[var(--coffee-cappuccino)] p-8 sm:p-12 text-center text-[var(--coffee-espresso)]">
            Aktualnie brak aktywnych kursów.
          </div>
        )}
      </div>
    </div>
  );
}
