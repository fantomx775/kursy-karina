import { cache } from "react";
import { FaLock, FaPlay } from "react-icons/fa";
import { createServerSupabaseClient } from "@/services/supabase/server";
import { getUserCourseAccess } from "@/services/courseAccess";
import type { CourseAccessStatus } from "@/services/courseAccess";
import { CoursePurchaseCard } from "@/features/courses/CoursePurchaseCard";
import { isPromoActive, getEffectivePriceCents } from "@/lib/coursePromo";
import {
  DEFAULT_COURSE_ACCESS_DURATION_MONTHS,
  formatAccessDuration,
} from "@/lib/accessDuration";
import { resolveCourseSaleState } from "@/lib/courseSales";
import type { Course, CourseWithContent } from "@/types/course";

type CoursePageAccess = {
  accessStatus: CourseAccessStatus;
  accessExpiresAt: string | null;
  purchasedAccessDurationMonths: number | null;
};

export const getCoursePageAccess = cache(
  async (courseId: string): Promise<CoursePageAccess> => {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        accessStatus: "none",
        accessExpiresAt: null,
        purchasedAccessDurationMonths: null,
      };
    }

    const access = await getUserCourseAccess(supabase, user.id, courseId);
    return {
      accessStatus: access.status,
      accessExpiresAt: access.activeExpiresAt ?? access.lastExpiresAt,
      purchasedAccessDurationMonths: access.accessDurationMonths,
    };
  },
);

function toPurchaseCourse(course: CourseWithContent): Course {
  return {
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
    access_duration_months: course.access_duration_months,
    sale_mode: course.sale_mode,
    sale_windows: course.sale_windows,
    created_at: course.created_at,
    updated_at: course.updated_at,
  };
}

type PurchasePanelProps = {
  course: CourseWithContent;
  variant: "mobile" | "desktop";
};

export async function CourseAccessPurchasePanel({
  course,
  variant,
}: PurchasePanelProps) {
  const purchaseCourse = toPurchaseCourse(course);
  const { accessStatus, accessExpiresAt, purchasedAccessDurationMonths } =
    await getCoursePageAccess(course.id);
  const saleState = resolveCourseSaleState(course);

  const priceBlock = (
    <div className="text-2xl sm:text-3xl font-semibold text-[var(--coffee-charcoal)] mb-4 flex flex-wrap items-baseline gap-2">
      {isPromoActive(course) && course.price !== getEffectivePriceCents(course) && (
        <span className="line-through text-xl font-normal text-[var(--coffee-espresso)]">
          {(course.price / 100).toFixed(2)} PLN
        </span>
      )}
      {(getEffectivePriceCents(course) / 100).toFixed(2)} PLN
    </div>
  );

  const purchaseCard = (
    <CoursePurchaseCard
      course={purchaseCourse}
      accessStatus={accessStatus}
      accessExpiresAt={accessExpiresAt}
      purchasedAccessDurationMonths={purchasedAccessDurationMonths}
    />
  );

  const infoBlock = (
    <div className="bg-white border border-[var(--coffee-cappuccino)] shadow-sm p-5 sm:p-6 text-sm text-[var(--coffee-espresso)] leading-relaxed">
      <p>Pełny dostęp do materiałów SVG i video YouTube.</p>
      <p className="mt-2">
        Dostęp po zakupie:{" "}
        {formatAccessDuration(
          course.access_duration_months ?? DEFAULT_COURSE_ACCESS_DURATION_MONTHS,
        )}
        .
      </p>
      {!saleState.isOpen ? (
        <p className="mt-2 font-medium text-[var(--coffee-mocha)]">Sprzedaż wkrótce.</p>
      ) : null}
      <p className="mt-2">Śledzenie postępów w panelu kursanta.</p>
    </div>
  );

  if (variant === "mobile") {
    return (
      <div className="space-y-4 lg:hidden">
        <div className="bg-white border border-[var(--coffee-cappuccino)] shadow-sm p-5 sm:p-6 border-radius">
          {priceBlock}
          {purchaseCard}
        </div>
        {infoBlock}
      </div>
    );
  }

  return (
    <aside className="hidden space-y-4 lg:block lg:sticky lg:top-24">
      <div className="bg-white border border-[var(--coffee-cappuccino)] shadow-sm p-5 sm:p-6 border-radius">
        {priceBlock}
        {purchaseCard}
      </div>
      {infoBlock}
    </aside>
  );
}

type ContentListProps = {
  course: CourseWithContent;
};

export async function CourseContentWithAccess({ course }: ContentListProps) {
  const { accessStatus } = await getCoursePageAccess(course.id);

  return (
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
                  className="flex items-center border-radius border border-[var(--coffee-cappuccino)] bg-[var(--coffee-cream)] px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2 text-[var(--coffee-charcoal)]">
                    {accessStatus === "active" ? (
                      <FaPlay className="text-[var(--coffee-mocha)]" />
                    ) : (
                      <FaLock className="text-[var(--coffee-espresso)]" />
                    )}
                    <span>{item.title}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
