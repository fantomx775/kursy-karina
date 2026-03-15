-- =============================================================================
-- CLEAN STATE FOR E2E TESTS
-- Uses a dedicated test database for safety.
-- Run before seeding when building deterministic E2E suites.
-- =============================================================================

SET session_replication_role = replica;

TRUNCATE TABLE
  public.course_progress,
  public.coupon_usage,
  public.order_items,
  public.orders,
  public.course_items,
  public.course_sections,
  public.courses,
  public.coupons,
  public.users
RESTART IDENTITY CASCADE;

TRUNCATE TABLE
  auth.identities,
  auth.users
RESTART IDENTITY CASCADE;

SET session_replication_role = DEFAULT;

-- Ensure roles needed by seed data are present after truncate of public.users.
INSERT INTO public.users (id, email, first_name, last_name, role)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'admin@test.local', 'Admin', 'Testowy', 'admin'),
  ('11111111-1111-1111-1111-111111111102', 'student1@test.local', 'Jan', 'Kowalski', 'student'),
  ('11111111-1111-1111-1111-111111111103', 'student2@test.local', 'Anna', 'Nowak', 'student'),
  ('11111111-1111-1111-1111-111111111104', 'student3@test.local', 'Piotr', 'Wiśniewski', 'student'),
  ('11111111-1111-1111-1111-111111111105', 'student4@test.local', 'Maria', 'Lewandowska', 'student')
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role;
