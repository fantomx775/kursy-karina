"use client";

import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { useCart } from "@/features/cart/CartContext";
import { createBrowserSupabaseClient } from "@/services/supabase/browser";
import { CartIcon } from "@/components/ui/Icon";

export function AppHeader() {
  const { user, profile, refreshProfile } = useAuth();
  const { cart } = useCart();
  const pathname = usePathname();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Refresh profile when route changes (e.g. after login). Run once per pathname change, not on every render.
  const lastPathRef = useRef<string | null>(null);
  useEffect(() => {
    if (!user?.id) return;
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    refreshProfile();
  }, [pathname, user?.id, refreshProfile]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleSignOut = useCallback(async () => {
    setMobileMenuOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
  }, [supabase, router]);

  const navLinkClass =
    "h-11 flex items-center px-1 text-sm text-[var(--coffee-espresso)] hover:text-[var(--coffee-mocha)] transition-colors";
  const mobileNavLinkClass =
    "block py-3 px-4 text-base text-[var(--coffee-espresso)] hover:text-[var(--coffee-mocha)] hover:bg-[var(--coffee-latte)] transition-colors min-h-[44px]";
  const cartLinkClass =
    "gap-2 border-radius items-baseline";

  const cartLabel = (itemsInCart: number) => (
    <span className="relative inline-flex items-center leading-none" aria-hidden>
      <CartIcon size="md" className="translate-y-[0.35em]" strokeWidth={1.5} />
      {itemsInCart > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 flex items-center justify-center px-0.5 text-[9px] font-medium text-white bg-[var(--coffee-espresso)] rounded-full leading-none">
          {itemsInCart > 9 ? "9+" : itemsInCart}
        </span>
      )}
    </span>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[var(--coffee-cappuccino)]">
      <div className="page-width flex items-center justify-between h-16">
        <Link
          href="/"
          className="flex items-center text-[var(--coffee-charcoal)] hover:opacity-90 transition-opacity"
          aria-label="Strona główna – Kursy"
        >
          <Image
            src="/logo/sygnet-header.png"
            alt=""
            width={48}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/courses" className={navLinkClass}>
            Kursy
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className={navLinkClass}>
                Mój panel
              </Link>
              <Link
                href="/cart"
                className={`${navLinkClass} ${cartLinkClass}`}
                aria-label={`Koszyk${cart.length > 0 ? `, ${cart.length} ${cart.length === 1 ? "pozycja" : "pozycje"}` : ""}`}
              >
                {cartLabel(cart.length)}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="h-11 flex items-center px-3 text-sm text-[var(--coffee-mocha)] hover:text-white hover:bg-[var(--coffee-mocha)] border border-[var(--coffee-mocha)] transition-colors border-radius"
              >
                Wyloguj
              </button>
            </>
          ) : (
            <>
              <Link
                href="/cart"
                className={`${navLinkClass} ${cartLinkClass}`}
                aria-label={`Koszyk${cart.length > 0 ? `, ${cart.length} pozycji` : ""}`}
              >
                {cartLabel(cart.length)}
              </Link>
              <Link href="/login" className={navLinkClass}>
                Zaloguj
              </Link>
              <Link
                href="/register"
                className="h-11 flex items-center px-4 text-sm text-white bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] transition-colors border-radius"
              >
                Rejestracja
              </Link>
            </>
          )}
        </nav>

        {/* Mobile hamburger button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden flex flex-col justify-center items-center w-11 h-11 gap-[5px] -mr-2"
          aria-label={mobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={mobileMenuOpen}
        >
          <span
            className={`block w-5 h-[2px] bg-[var(--coffee-charcoal)] transition-all duration-300 ${
              mobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`block w-5 h-[2px] bg-[var(--coffee-charcoal)] transition-all duration-300 ${
              mobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-[2px] bg-[var(--coffee-charcoal)] transition-all duration-300 ${
              mobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden fixed inset-0 top-16 bg-black/20 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu panel */}
      <div
        className={`sm:hidden fixed top-16 left-0 right-0 bg-white border-b border-[var(--coffee-cappuccino)] shadow-lg z-40 transition-all duration-300 ${
          mobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <nav className="py-2">
          <Link href="/courses" className={mobileNavLinkClass}>
            Kursy
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className={mobileNavLinkClass}>
                Mój panel
              </Link>
              <Link
                href="/cart"
                className={`${mobileNavLinkClass} flex items-center gap-2 leading-none`}
                aria-label={`Koszyk${cart.length > 0 ? `, ${cart.length} pozycji` : ""}`}
              >
                {cartLabel(cart.length)}
              </Link>
              <div className="px-4 py-3">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-3 text-sm text-[var(--coffee-mocha)] border border-[var(--coffee-mocha)] hover:bg-[var(--coffee-mocha)] hover:text-white transition-colors border-radius"
                >
                  Wyloguj
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/cart"
                className={`${mobileNavLinkClass} flex items-center gap-2 leading-none`}
                aria-label={`Koszyk${cart.length > 0 ? `, ${cart.length} pozycji` : ""}`}
              >
                {cartLabel(cart.length)}
              </Link>
              <Link href="/login" className={mobileNavLinkClass}>
                Zaloguj
              </Link>
              <div className="px-4 py-3">
                <Link
                  href="/register"
                  className="block w-full py-3 text-sm text-center text-white bg-[var(--coffee-mocha)] hover:bg-[var(--coffee-espresso)] transition-colors border-radius"
                >
                  Rejestracja
                </Link>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
