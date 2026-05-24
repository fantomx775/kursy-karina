"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/CartContext";
import { Button } from "@/components/ui";
import type { Course } from "@/types/course";
import { getEffectivePriceCents } from "@/lib/coursePromo";
import {
  DEFAULT_COURSE_ACCESS_DURATION_MONTHS,
  formatAccessDuration,
  normalizeAccessDurationMonths,
} from "@/lib/accessDuration";

type CourseAccessStatus = "none" | "pending" | "active" | "expired";

type Props = {
  course: Course;
  accessStatus: CourseAccessStatus;
  accessExpiresAt: string | null;
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
}: Props) {
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const effectivePriceCents = getEffectivePriceCents(course);
  const accessDurationMonths = normalizeAccessDurationMonths(
    course.access_duration_months ?? DEFAULT_COURSE_ACCESS_DURATION_MONTHS,
  );

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
        <Button variant="secondary" fullWidth disabled>
          Oczekuje na aktywację
        </Button>
        <p className="text-center text-xs text-[var(--coffee-espresso)]">
          Zamówienie jest opłacone. Dostęp zostanie aktywowany przez
          administrację.
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
        Dostęp po zakupie: {formatAccessDuration(accessDurationMonths)}.
      </p>
    </div>
  );
}
