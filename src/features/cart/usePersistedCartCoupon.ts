"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const CART_APPLIED_COUPON_KEY = "cart-applied-coupon";

type PersistedCoupon = {
  code: string;
  discountAmount: number;
};

type CartItemForCoupon = {
  id: string;
  price: number;
};

type UsePersistedCartCouponOptions = {
  subtotal: number;
  cart: CartItemForCoupon[];
  cartCourseKey: string;
};

type CouponValidationResult =
  | { ok: true; code: string; discountAmount: number }
  | { ok: false; error: string };

export function usePersistedCartCoupon({
  subtotal,
  cart,
  cartCourseKey,
}: UsePersistedCartCouponOptions) {
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(
    null,
  );
  const [applyError, setApplyError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const previousCartCourseKeyRef = useRef(cartCourseKey);
  const hasRevalidatedRef = useRef(false);

  const clearPersistedCoupon = useCallback(() => {
    localStorage.removeItem(CART_APPLIED_COUPON_KEY);
    setDiscountAmount(0);
    setAppliedCouponCode(null);
  }, []);

  const persistCoupon = useCallback((code: string, amount: number) => {
    const payload: PersistedCoupon = { code, discountAmount: amount };
    localStorage.setItem(CART_APPLIED_COUPON_KEY, JSON.stringify(payload));
  }, []);

  const validateCoupon = useCallback(
    async (code: string): Promise<CouponValidationResult> => {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          subtotalAmount: subtotal,
          cartItems: cart.map((item) => ({
            courseId: item.id,
            amount: item.price,
          })),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        return {
          ok: false,
          error: data.error ?? "Nie udało się zastosować kuponu.",
        };
      }

      return {
        ok: true,
        code: code.trim().toUpperCase(),
        discountAmount: data.discountAmount ?? 0,
      };
    },
    [cart, subtotal],
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_APPLIED_COUPON_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PersistedCoupon;
        if (parsed.code) {
          setCouponCode(parsed.code);
          setAppliedCouponCode(parsed.code);
          setDiscountAmount(parsed.discountAmount ?? 0);
        }
      }
    } catch {
      localStorage.removeItem(CART_APPLIED_COUPON_KEY);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || hasRevalidatedRef.current || cart.length === 0) {
      return;
    }

    if (!appliedCouponCode) {
      return;
    }

    hasRevalidatedRef.current = true;

    void (async () => {
      const result = await validateCoupon(appliedCouponCode);
      if (!result.ok) {
        clearPersistedCoupon();
        setApplyError("Zapisany kupon nie jest już ważny. Zastosuj go ponownie.");
        return;
      }

      setDiscountAmount(result.discountAmount);
      persistCoupon(result.code, result.discountAmount);
    })();
  }, [
    appliedCouponCode,
    cart.length,
    clearPersistedCoupon,
    isHydrated,
    persistCoupon,
    validateCoupon,
  ]);

  useEffect(() => {
    if (previousCartCourseKeyRef.current === cartCourseKey) {
      return;
    }

    previousCartCourseKeyRef.current = cartCourseKey;
    if (!appliedCouponCode) {
      return;
    }

    clearPersistedCoupon();
    setApplyError("Zawartość koszyka się zmieniła. Zastosuj kupon ponownie.");
  }, [appliedCouponCode, cartCourseKey, clearPersistedCoupon]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setApplyError("Wpisz kod kuponu.");
      return;
    }

    setApplyError(null);
    setIsApplying(true);

    const result = await validateCoupon(couponCode);
    if (!result.ok) {
      setApplyError(result.error);
      clearPersistedCoupon();
    } else {
      setDiscountAmount(result.discountAmount);
      setAppliedCouponCode(result.code);
      persistCoupon(result.code, result.discountAmount);
    }

    setIsApplying(false);
  };

  return {
    couponCode,
    setCouponCode,
    discountAmount,
    appliedCouponCode,
    applyError,
    setApplyError,
    isApplying,
    handleApplyCoupon,
  };
}
