-- Wyzerowanie kursów i progresów (faza testowa, bez użytkowników)
-- Wyzerowanie kursów i progresów (faza testowa, bez użytkowników)
-- Usuwa: certyfikaty, progresy, pozycje zamowien powiazane z kursami, lekcje,
-- sekcje i kursy.
-- Nie usuwa: users, auth.users, orders, coupons, coupon_usage.
-- =============================================================================

TRUNCATE TABLE
  public.course_certificates,
  public.course_progress,
  public.order_items,
  public.course_items,
  public.course_sections,
  public.courses
RESTART IDENTITY CASCADE;
