"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/CartContext";
import { Badge, Button } from "@/components/ui";
import type { CourseAccessStatus } from "@/services/courseAccess";
import type { Course } from "@/types/course";
import { getEffectivePriceCents } from "@/lib/coursePromo";
import {
  DEFAULT_COURSE_ACCESS_DURATION_MONTHS,
  formatAccessDuration,
  normalizeAccessDurationMonths,
} from "@/lib/accessDuration";
import {
  formatSaleWindowRange,
  resolveCourseSaleState,
} from "@/lib/courseSales";

type Props = {
  course: Course;
  accessStatus: CourseAccessStatus;
  accessExpiresAt: string | null;
  purchasedAccessDurationMonths?: number | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function CoursePurchaseCard({
  course,
  accessStatus,
  accessExpiresAt,
  purchasedAccessDurationMonths,
}: Props) {
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const effectivePriceCents = getEffectivePriceCents(course);
  const accessDurationMonths = normalizeAccessDurationMonths(
    course.access_duration_months ?? DEFAULT_COURSE_ACCESS_DURATION_MONTHS,
  );
  const pendingAccessDurationMonths = normalizeAccessDurationMonths(
    purchasedAccessDurationMonths ?? accessDurationMonths,
  );
  const saleState = resolveCourseSaleState(course);

  if (accessStatus === "active") {
    return (
      <div className="space-y-3">
        <Button
          variant="primary"
          fullWidth
          onClick={() => router.push(`/learn/${course.slug}`)}
        >
          Rozpocznij naukę
        </Button>
        <p className="text-center text-xs text-[var(--coffee-espresso)]">
          Dostęp aktywny do: {formatDate(accessExpiresAt)}
        </p>
      </div>
    );
  }

  if (accessStatus === "pending") {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="success" rounded={false} size="md">
            Zakup potwierdzony
          </Badge>
          <Badge variant="warning" rounded={false} size="md">
            Dostęp oczekuje na aktywację
          </Badge>
        </div>
        <p className="text-center text-xs text-[var(--coffee-espresso)]">
          Dostęp do materiałów uruchomi administrator.{" "}
          {formatAccessDuration(pendingAccessDurationMonths)} zacznie się liczyć
          dopiero od aktywacji.
        </p>
      </div>
    );
  }

  if (!saleState.isOpen) {
    const nextWindow = formatSaleWindowRange(saleState.nextWindow);

    return (
      <div className="space-y-3">
        <Button variant="secondary" fullWidth disabled>
          Sprzedaż wkrótce
        </Button>
        <p className="text-center text-xs text-[var(--coffee-espresso)]">
          {nextWindow
            ? `Najbliższe okno sprzedaży: ${nextWindow}.`
            : "Termin kolejnej sprzedaży pojawi się w opisie kursu."}
        </p>
      </div>
    );
  }

  const cta =
    accessStatus === "expired" ? "Przedłuż dostęp" : "Dodaj do koszyka";

  return (
    <div className="space-y-3">
      <Button
        variant="primary"
        fullWidth
        onClick={() => {
          if (!isInCart(course.id)) {
            addToCart({
              id: course.id,
              title: course.title,
              description: course.description,
              price: effectivePriceCents,
              originalPrice: course.price,
              accessDurationMonths,
              imageUrl: course.main_image_url ?? null,
            });
          }
          router.push("/cart");
        }}
      >
        {cta}
      </Button>
      <p className="text-xs text-[var(--coffee-espresso)] text-center">
        Dostęp po aktywacji: {formatAccessDuration(accessDurationMonths)}.
      </p>
    </div>
  );
}
