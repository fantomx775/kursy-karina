-- =============================================================================
-- Wyzerowanie kursów i progresów (faza testowa, bez użytkowników)
-- Usuwa: progresy, pozycje zamówień powiązane z kursami, lekcje, sekcje, kursy.
-- Nie usuwa: users, auth.users, orders, coupons, coupon_usage.
-- =============================================================================

-- Kolejność: od tabel zależnych do kursów, na końcu same kursy.
TRUNCATE TABLE
  public.course_progress,
  public.order_items,
  public.course_items,
  public.course_sections,
  public.courses
RESTART IDENTITY CASCADE;
