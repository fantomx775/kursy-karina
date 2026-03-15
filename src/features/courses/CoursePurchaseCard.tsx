"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/CartContext";
import { Button } from "@/components/ui";
import type { Course } from "@/types/course";
import { getEffectivePriceCents } from "@/lib/coursePromo";

type Props = {
  course: Course;
  isOwned: boolean;
};

export function CoursePurchaseCard({ course, isOwned }: Props) {
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const effectivePriceCents = getEffectivePriceCents(course);

  if (isOwned) {
    return (
      <Button
        variant="primary"
        fullWidth
        onClick={() => router.push(`/learn/${course.slug}`)}
      >
        Rozpocznij naukę
      </Button>
    );
  }

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
              imageUrl: course.main_image_url ?? null,
            });
          }
          router.push("/cart");
        }}
      >
        Dodaj do koszyka
      </Button>
      <p className="text-xs text-[var(--coffee-espresso)] text-center">
        Dostęp po zakupie: 12 miesięcy.
      </p>
    </div>
  );
}
