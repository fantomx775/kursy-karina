"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/CartContext";
import { useAuth } from "@/features/auth/AuthContext";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart } = useCart();
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price, 0),
    [cart],
  );
  const sumOriginal = useMemo(
    () => cart.reduce((sum, item) => sum + item.originalPrice, 0),
    [cart],
  );
  const promotionDiscount = sumOriginal - subtotal;
  const totalDiscount = promotionDiscount + discountAmount;
  const total = subtotal - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    if (!user) {
      router.push("/login");
      return;
    }
    setApplyError(null);
    setIsApplying(true);
    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotalAmount: subtotal }),
    });
    const data = await response.json();
    if (!response.ok) {
      setApplyError(data.error ?? "Nie udało się zastosować kuponu.");
      setDiscountAmount(0);
      setAppliedCouponCode(null);
    } else {
      setDiscountAmount(data.discountAmount ?? 0);
      setAppliedCouponCode(couponCode.trim().toUpperCase());
    }
    setIsApplying(false);
  };

  const handleCheckout = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setCheckoutError(null);
    setIsCheckingOut(true);

    const response = await fetch("/api/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart, couponCode: couponCode || null }),
    });

    const data = await response.json();
    if (data.alreadyPurchased) {
      setCheckoutError(data.message ?? "Wszystkie kursy są już zakupione.");
      setIsCheckingOut(false);
      return;
    }

    if (!response.ok) {
      setCheckoutError(data.error ?? "Nie udało się utworzyć płatności.");
      setIsCheckingOut(false);
      return;
    }

    if (data.url) {
      router.push(data.url);
    } else {
      setCheckoutError("Brak linku do płatności.");
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--coffee-cream)] flex items-center justify-center page-width">
        <div className="bg-white border border-[var(--coffee-cappuccino)] p-6 sm:p-8 text-center max-w-md w-full">
          <h1 className="text-2xl font-semibold text-[var(--coffee-charcoal)] mb-2">
            Koszyk jest pusty
          </h1>
          <p className="text-[var(--coffee-espresso)] mb-4">
            Dodaj kursy, aby kontynuować.
          </p>
          <button
            className="bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white px-5 py-2.5 text-sm transition-colors min-h-[44px]"
            onClick={() => router.push("/courses")}
          >
            Przeglądaj kursy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--coffee-cream)] to-[var(--coffee-latte)] py-10 sm:py-14 lg:py-20">
      <div className="page-width grid gap-6 lg:gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {cart.map((item) => {
            const onPromo = item.originalPrice > item.price;
            return (
              <div
                key={item.id}
                className="bg-white border border-[var(--coffee-cappuccino)] p-4 sm:p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-semibold text-[var(--coffee-charcoal)]">
                    {item.title}
                  </div>
                  <div className="text-sm text-[var(--coffee-espresso)] flex flex-wrap items-baseline gap-1.5">
                    {onPromo ? (
                      <>
                        <span className="line-through">
                          {(item.originalPrice / 100).toFixed(2)} PLN
                        </span>
                        <span className="font-medium text-[var(--coffee-charcoal)]">
                          {(item.price / 100).toFixed(2)} PLN
                        </span>
                      </>
                    ) : (
                      <span>{(item.price / 100).toFixed(2)} PLN</span>
                    )}
                  </div>
                </div>
                <button
                  className="text-sm text-red-600 hover:text-red-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                  onClick={() => removeFromCart(item.id)}
                >
                  Usuń
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-[var(--coffee-cappuccino)] p-5 sm:p-6 space-y-4">
          <h2 className="text-xl font-semibold text-[var(--coffee-charcoal)]">
            Podsumowanie
          </h2>

          <div className="space-y-2 border-b border-[var(--coffee-cappuccino)] pb-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--coffee-espresso)]">
              Pozycje
            </p>
            {cart.map((item) => {
              const onPromo = item.originalPrice > item.price;
              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <span className="text-[var(--coffee-charcoal)] line-clamp-2 min-w-0">
                    {item.title}
                  </span>
                  <span className="flex-shrink-0 text-right">
                    {onPromo ? (
                      <>
                        <span className="line-through text-[var(--coffee-espresso)] mr-1">
                          {(item.originalPrice / 100).toFixed(2)}
                        </span>
                        <span className="font-medium text-[var(--coffee-charcoal)]">
                          {(item.price / 100).toFixed(2)} PLN
                        </span>
                      </>
                    ) : (
                      <span className="text-[var(--coffee-charcoal)]">
                        {(item.price / 100).toFixed(2)} PLN
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-sm text-[var(--coffee-espresso)]">
            <span>Suma</span>
            <span>{(sumOriginal / 100).toFixed(2)} PLN</span>
          </div>
          {promotionDiscount > 0 ? (
            <div className="flex items-center justify-between text-sm text-[var(--coffee-espresso)]">
              <span>Promocja</span>
              <span className="text-[var(--success-dark)]">-{(promotionDiscount / 100).toFixed(2)} PLN</span>
            </div>
          ) : null}
          {discountAmount > 0 ? (
            <div className="flex items-center justify-between text-sm text-[var(--coffee-espresso)]">
              <span>Kupon</span>
              <span className="text-[var(--success-dark)]">-{(discountAmount / 100).toFixed(2)} PLN</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between text-lg font-semibold text-[var(--coffee-charcoal)]">
            <span>Razem</span>
            <span>{(total / 100).toFixed(2)} PLN</span>
          </div>

          {totalDiscount > 0 ? (
            <p className="text-sm text-[var(--success-dark)] font-medium">
              Oszczędzasz: {(totalDiscount / 100).toFixed(2)} PLN
            </p>
          ) : null}

          {appliedCouponCode ? (
            <div
              className="border-radius flex items-center gap-2 border border-[var(--success-dark)]/30 bg-[var(--success-light)] px-3 py-2.5 text-sm text-[var(--success-dark)]"
              role="status"
              aria-live="polite"
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--success)] text-white text-xs font-bold" aria-hidden>
                ✓
              </span>
              <span>
                Kod <strong>{appliedCouponCode}</strong> został zastosowany.
              </span>
            </div>
          ) : null}

          <div className="space-y-2">
            <input
              className="w-full border border-[var(--coffee-cappuccino)] px-3 py-2.5 text-sm min-h-[44px]"
              placeholder="Kod kuponu"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
            />
            <button
              className="w-full border border-[var(--coffee-mocha)] text-[var(--coffee-mocha)] py-2.5 text-sm hover:bg-[var(--coffee-mocha)] hover:text-white transition-colors min-h-[44px] disabled:opacity-50"
              onClick={handleApplyCoupon}
              disabled={isApplying}
            >
              {isApplying ? "Sprawdzanie..." : "Zastosuj kupon"}
            </button>
            {applyError ? (
              <div className="text-xs text-red-600">{applyError}</div>
            ) : null}
          </div>

          {checkoutError ? (
            <div className="text-sm text-red-600">{checkoutError}</div>
          ) : null}

          <button
            className="w-full bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] text-white py-3 text-sm font-medium transition-colors min-h-[48px] disabled:opacity-50"
            onClick={handleCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? "Przekierowanie..." : "Przejdź do płatności"}
          </button>
        </div>
      </div>
    </div>
  );
}
