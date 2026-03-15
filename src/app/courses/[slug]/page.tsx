import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FaLock, FaPlay } from "react-icons/fa";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { getCourseWithContentBySlug } from "@/services/courses";
import { CoursePurchaseCard } from "@/features/courses/CoursePurchaseCard";
import { isPromoActive, getEffectivePriceCents } from "@/lib/coursePromo";
import type { Course } from "@/types/course";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const course = await getCourseWithContentBySlug(slug);
  if (!course || course.status !== "active") {
    notFound();
  }

  let ownsCourse = false;
  if (user) {
    const { data: orders } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "paid");

    const orderIds = orders?.map((order) => order.id) ?? [];
    if (orderIds.length > 0) {
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("course_id")
        .in("order_id", orderIds);
      ownsCourse = Boolean(
        orderItems?.some((item) => item.course_id === course.id),
      );
    }
  }

  // Pass only purchase-card fields to the client component to avoid exposing
  // full course content (e.g. item asset paths/URLs) in serialized props.
  const purchaseCourse: Course = {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    price: course.price,
    status: course.status,
    main_image_url: course.main_image_url,
    promotion_discount_type: course.promotion_discount_type,
    promotion_discount_value: course.promotion_discount_value,
    promotion_start_date: course.promotion_start_date,
    promotion_end_date: course.promotion_end_date,
    created_at: course.created_at,
    updated_at: course.updated_at,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--coffee-cream)] to-white py-10 sm:py-14 lg:py-20">
      <div className="page-width">
        <nav className="text-sm text-[var(--coffee-espresso)] mb-4 sm:mb-6">
          <Link href="/courses" className="hover:underline">
            Kursy
          </Link>{" "}
          / {course.title}
        </nav>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5 sm:space-y-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[var(--coffee-charcoal)]">
              {course.title}
            </h1>

            {course.main_image_url ? (
              <div className="relative w-full max-w-xl aspect-video overflow-hidden bg-[var(--coffee-cappuccino)] border border-[var(--coffee-cappuccino)]">
                <Image
                  src={course.main_image_url}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 36rem"
                />
              </div>
            ) : null}

            <p className="text-[var(--coffee-espresso)] text-base sm:text-lg leading-relaxed">{course.description}</p>

            <div className="bg-white border border-[var(--coffee-cappuccino)] shadow-sm overflow-hidden">
              <div className="border-b border-[var(--coffee-cappuccino)] px-4 sm:px-5 py-3 text-[var(--coffee-charcoal)] font-semibold">
                Zawartość kursu
              </div>
              <div className="divide-y divide-[var(--coffee-cappuccino)]">
                {course.sections.map((section) => (
                  <div key={section.id} className="p-4 sm:p-5">
                    <h2 className="text-base sm:text-lg font-semibold text-[var(--coffee-charcoal)] mb-3">
                      {section.title}
                    </h2>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between border-radius border border-[var(--coffee-cappuccino)] bg-[var(--coffee-cream)] px-3 py-2 text-sm"
                        >
                          <div className="flex items-center gap-2 text-[var(--coffee-charcoal)]">
                            {ownsCourse ? (
                              <FaPlay className="text-[var(--coffee-mocha)]" />
                            ) : (
                              <FaLock className="text-[var(--coffee-espresso)]" />
                            )}
                            <span>{item.title}</span>
                          </div>
                          <span className="text-xs text-[var(--coffee-espresso)]">
                            {item.kind === "svg" ? "SVG" : "YouTube"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-white border border-[var(--coffee-cappuccino)] shadow-sm p-5 sm:p-6 border-radius">
              <div className="text-2xl sm:text-3xl font-semibold text-[var(--coffee-charcoal)] mb-4 flex flex-wrap items-baseline gap-2">
                {isPromoActive(course) && course.price !== getEffectivePriceCents(course) && (
                  <span className="line-through text-xl font-normal text-[var(--coffee-espresso)]">
                    {(course.price / 100).toFixed(2)} PLN
                  </span>
                )}
                {(getEffectivePriceCents(course) / 100).toFixed(2)} PLN
              </div>
              <CoursePurchaseCard course={purchaseCourse} isOwned={ownsCourse} />
            </div>
            <div className="bg-white border border-[var(--coffee-cappuccino)] shadow-sm p-5 sm:p-6 text-sm text-[var(--coffee-espresso)] leading-relaxed">
              <p>Pełny dostęp do materiałów SVG i video YouTube.</p>
              <p className="mt-2">Śledzenie postępów w panelu kursanta.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
