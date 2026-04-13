-- =============================================================================
-- COMPREHENSIVE TEST DATA SEED
-- Kursy App Modern – kilka kursów, studenci z zakupami, kupony, postępy
--
-- Uruchom w Supabase SQL Editor (jako postgres/service role).
-- Hasło dla wszystkich użytkowników testowych: TestHaslo123!
--
-- Przy ponownym uruchomieniu wstawianie jest idempotentne (ON CONFLICT DO NOTHING
-- lub DO UPDATE tam gdzie potrzeba). Aby wstawić wszystko od zera, usuń wcześniej
-- dane testowe (użytkowników po emailu *@test.local, kursy po stałych UUID).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. KURSY (z sekcjami i lekcjami)
-- =============================================================================

-- Kurs 1: React od zera
INSERT INTO courses (id, title, slug, description, price, status, main_image_url)
VALUES (
  'a0000001-0001-4000-8000-000000000001',
  'React od zera – kompletny kurs',
  'react-od-zera',
  'Naucz się Reacta od podstaw: komponenty, hooks, stan, routing i TypeScript. Praktyczne projekty i dożywotni dostęp.',
  29900,
  'active',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Promocja na kurs 1 (wymaga wykonania add_course_promotion.sql)
UPDATE courses
SET
  promotion_discount_type = 'percentage',
  promotion_discount_value = 20,
  promotion_start_date = '2020-01-01T00:00:00+00:00',
  promotion_end_date = '2030-12-31T23:59:59+00:00'
WHERE id = 'a0000001-0001-4000-8000-000000000001'
  AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'promotion_discount_type');

INSERT INTO course_sections (id, course_id, title, position)
VALUES
  ('b0000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', 'Wprowadzenie', 0),
  ('b0000001-0001-4000-8000-000000000002', 'a0000001-0001-4000-8000-000000000001', 'Komponenty i JSX', 1),
  ('b0000001-0001-4000-8000-000000000003', 'a0000001-0001-4000-8000-000000000001', 'Hooks w praktyce', 2)
ON CONFLICT DO NOTHING;

INSERT INTO course_items (section_id, title, kind, asset_path, youtube_url, position, is_preview)
VALUES
  ('b0000001-0001-4000-8000-000000000001', 'Czym jest React?', 'youtube', NULL, 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 0, true),
  ('b0000001-0001-4000-8000-000000000001', 'Środowisko i Vite', 'svg', 'intro/setup.svg', NULL, 1, false),
  ('b0000001-0001-4000-8000-000000000002', 'Pierwszy komponent', 'svg', 'components/first.svg', NULL, 0, true),
  ('b0000001-0001-4000-8000-000000000002', 'Props i children', 'youtube', NULL, 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, false),
  ('b0000001-0001-4000-8000-000000000003', 'useState', 'svg', 'hooks/useState.svg', NULL, 0, false),
  ('b0000001-0001-4000-8000-000000000003', 'useEffect', 'svg', 'hooks/useEffect.svg', NULL, 1, false)
ON CONFLICT (section_id, position) DO NOTHING;

-- Kurs 2: TypeScript dla każdego
INSERT INTO courses (id, title, slug, description, price, status, main_image_url)
VALUES (
  'a0000001-0001-4000-8000-000000000002',
  'TypeScript dla każdego',
  'typescript-dla-kazdego',
  'Typy, interfejsy, generyki i dobre praktyki. Przejdź z JavaScriptu na TypeScript w jeden weekend.',
  19900,
  'active',
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO course_sections (id, course_id, title, position)
VALUES
  ('b0000002-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000002', 'Podstawy typów', 0),
  ('b0000002-0001-4000-8000-000000000002', 'a0000001-0001-4000-8000-000000000002', 'Zaawansowany TypeScript', 1)
ON CONFLICT DO NOTHING;

INSERT INTO course_items (section_id, title, kind, asset_path, youtube_url, position, is_preview)
VALUES
  ('b0000002-0001-4000-8000-000000000001', 'Dlaczego TypeScript?', 'youtube', NULL, 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 0, true),
  ('b0000002-0001-4000-8000-000000000001', 'Interfejsy i type', 'svg', 'ts/interfaces.svg', NULL, 1, false),
  ('b0000002-0001-4000-8000-000000000002', 'Generyki', 'svg', 'ts/generics.svg', NULL, 0, false),
  ('b0000002-0001-4000-8000-000000000002', 'Utility types', 'youtube', NULL, 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, false)
ON CONFLICT (section_id, position) DO NOTHING;

-- Kurs 3: Next.js 14 – pełny stack
INSERT INTO courses (id, title, slug, description, price, status, main_image_url)
VALUES (
  'a0000001-0001-4000-8000-000000000003',
  'Next.js 14 – pełny stack',
  'nextjs-14-pelny-stack',
  'App Router, Server Components, API routes, baza danych i deployment. Zbuduj produkcyjną aplikację krok po kroku.',
  39900,
  'active',
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO course_sections (id, course_id, title, position)
VALUES
  ('b0000003-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000003', 'App Router', 0),
  ('b0000003-0001-4000-8000-000000000002', 'a0000001-0001-4000-8000-000000000003', 'Server i Client Components', 1)
ON CONFLICT DO NOTHING;

INSERT INTO course_items (section_id, title, kind, asset_path, youtube_url, quiz_data, position, is_preview)
VALUES
  ('b0000003-0001-4000-8000-000000000001', 'Struktura projektu', 'svg', 'next/structure.svg', NULL, NULL, 0, true),
  ('b0000003-0001-4000-8000-000000000001', 'Routing i layouty', 'youtube', NULL, 'https://www.youtube.com/watch?v=dGcsHMXbSOA', NULL, 1, false),
  ('b0000003-0001-4000-8000-000000000002', 'Kiedy Server, kiedy Client', 'svg', 'next/server-client.svg', NULL, NULL, 0, false),
  (
    'b0000003-0001-4000-8000-000000000002',
    'Quiz podsumowujacy App Router',
    'quiz',
    NULL,
    NULL,
    '{
      "questions": [
        {
          "text": "Ktory katalog odpowiada za routing w App Router?",
          "type": "single",
          "answers": [
            { "text": "app", "isCorrect": true },
            { "text": "pages", "isCorrect": false },
            { "text": "routes", "isCorrect": false }
          ]
        },
        {
          "text": "Ktore elementy sa standardem App Router?",
          "type": "multiple",
          "answers": [
            { "text": "layout.tsx", "isCorrect": true },
            { "text": "page.tsx", "isCorrect": true },
            { "text": "getServerSideProps", "isCorrect": false }
          ]
        }
      ]
    }'::jsonb,
    1,
    false
  )
ON CONFLICT (section_id, position) DO NOTHING;

-- Kurs 4: CSS i design system (nieaktywny – do testów filtra)
INSERT INTO courses (id, title, slug, description, price, status, main_image_url)
VALUES (
  'a0000001-0001-4000-8000-000000000004',
  'CSS i design system (wkrótce)',
  'css-design-system',
  'Kurs w przygotowaniu – zapisz się na listę oczekujących.',
  14900,
  'inactive',
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO course_sections (id, course_id, title, position)
VALUES ('b0000004-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000004', 'Plan kursu', 0)
ON CONFLICT DO NOTHING;

INSERT INTO course_items (section_id, title, kind, asset_path, youtube_url, position, is_preview)
VALUES ('b0000004-0001-4000-8000-000000000001', 'Zapowiedź', 'youtube', NULL, 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 0, true)
ON CONFLICT (section_id, position) DO NOTHING;

-- Kurs 5: Node.js i API
INSERT INTO courses (id, title, slug, description, price, status, main_image_url)
VALUES (
  'a0000001-0001-4000-8000-000000000005',
  'Node.js i REST API',
  'nodejs-rest-api',
  'Express, baza danych, autentykacja JWT i testy. Backend od zera do deploymentu.',
  24900,
  'active',
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO course_sections (id, course_id, title, position)
VALUES
  ('b0000005-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000005', 'Express od zera', 0)
ON CONFLICT DO NOTHING;

INSERT INTO course_items (section_id, title, kind, asset_path, youtube_url, position, is_preview)
VALUES
  ('b0000005-0001-4000-8000-000000000001', 'Pierwszy serwer', 'svg', 'node/first-server.svg', NULL, 0, true),
  ('b0000005-0001-4000-8000-000000000001', 'Routing i middleware', 'youtube', NULL, 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, false)
ON CONFLICT (section_id, position) DO NOTHING;

-- =============================================================================
-- 2. KUPONY
-- =============================================================================

INSERT INTO coupons (id, name, code, discount_type, discount_value, start_date, end_date, usage_limit, usage_limit_per_user, is_active)
VALUES
  ('c0000001-0001-4000-8000-000000000001', 'Start 2025', 'START2025', 'percentage', 20, NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days', 100, 1, true),
  ('c0000001-0001-4000-8000-000000000002', 'Rabat stały 50 zł', 'MINUS50', 'fixed', 5000, NOW() - INTERVAL '7 days', NULL, NULL, 1, true),
  ('c0000001-0001-4000-8000-000000000003', 'Mega wyprzedaż', 'MEGA30', 'percentage', 30, NOW(), NOW() + INTERVAL '14 days', 50, 2, true),
  ('c0000001-0001-4000-8000-000000000004', 'Wygasły kupon', 'STARY', 'percentage', 15, NOW() - INTERVAL '90 days', NOW() - INTERVAL '1 day', 10, 1, true),
  ('c0000001-0001-4000-8000-000000000005', 'Jednorazowy VIP', 'VIP100', 'fixed', 10000, NOW(), NULL, 5, 1, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 3. UŻYTKOWNICY TESTOWI (auth.users + auth.identities; public.users przez trigger)
-- Hasło dla wszystkich: TestHaslo123!
-- =============================================================================

DO $$
DECLARE
  v_pw TEXT := crypt('TestHaslo123!', gen_salt('bf'));
  v_inst UUID := '00000000-0000-0000-0000-000000000000';
  v_meta JSONB := '{"provider":"email","providers":["email"]}';
BEGIN
  -- Admin
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    '11111111-1111-1111-1111-111111111101',
    v_inst,
    'authenticated',
    'authenticated',
    'admin@test.local',
    v_pw,
    NOW(),
    v_meta,
    '{"full_name": "Admin Testowy"}',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    '11111111-1111-1111-1111-111111111101',
    '11111111-1111-1111-1111-111111111101',
    '{"sub": "11111111-1111-1111-1111-111111111101", "email": "admin@test.local"}'::jsonb,
    'email',
    '11111111-1111-1111-1111-111111111101',
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Student 1
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    '11111111-1111-1111-1111-111111111102',
    v_inst,
    'authenticated',
    'authenticated',
    'student1@test.local',
    v_pw,
    NOW(),
    v_meta,
    '{"full_name": "Jan Kowalski"}',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    '11111111-1111-1111-1111-111111111102',
    '11111111-1111-1111-1111-111111111102',
    '{"sub": "11111111-1111-1111-1111-111111111102", "email": "student1@test.local"}'::jsonb,
    'email',
    '11111111-1111-1111-1111-111111111102',
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Student 2
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    '11111111-1111-1111-1111-111111111103',
    v_inst,
    'authenticated',
    'authenticated',
    'student2@test.local',
    v_pw,
    NOW(),
    v_meta,
    '{"full_name": "Anna Nowak"}',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    '11111111-1111-1111-1111-111111111103',
    '11111111-1111-1111-1111-111111111103',
    '{"sub": "11111111-1111-1111-1111-111111111103", "email": "student2@test.local"}'::jsonb,
    'email',
    '11111111-1111-1111-1111-111111111103',
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Student 3
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    '11111111-1111-1111-1111-111111111104',
    v_inst,
    'authenticated',
    'authenticated',
    'student3@test.local',
    v_pw,
    NOW(),
    v_meta,
    '{"full_name": "Piotr Wiśniewski"}',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    '11111111-1111-1111-1111-111111111104',
    '11111111-1111-1111-1111-111111111104',
    '{"sub": "11111111-1111-1111-1111-111111111104", "email": "student3@test.local"}'::jsonb,
    'email',
    '11111111-1111-1111-1111-111111111104',
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Student 4
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    '11111111-1111-1111-1111-111111111105',
    v_inst,
    'authenticated',
    'authenticated',
    'student4@test.local',
    v_pw,
    NOW(),
    v_meta,
    '{"full_name": "Maria Lewandowska"}',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (
    '11111111-1111-1111-1111-111111111105',
    '11111111-1111-1111-1111-111111111105',
    '{"sub": "11111111-1111-1111-1111-111111111105", "email": "student4@test.local"}'::jsonb,
    'email',
    '11111111-1111-1111-1111-111111111105',
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Uzupełnij public.users (jeśli trigger nie zadziałał przy ON CONFLICT DO NOTHING – np. przy pierwszym uruchomieniu trigger mógł nie wstawić)
INSERT INTO public.users (id, email, first_name, last_name, role)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'admin@test.local', 'Admin', 'Testowy', 'admin'),
  ('11111111-1111-1111-1111-111111111102', 'student1@test.local', 'Jan', 'Kowalski', 'student'),
  ('11111111-1111-1111-1111-111111111103', 'student2@test.local', 'Anna', 'Nowak', 'student'),
  ('11111111-1111-1111-1111-111111111104', 'student3@test.local', 'Piotr', 'Wiśniewski', 'student'),
  ('11111111-1111-1111-1111-111111111105', 'student4@test.local', 'Maria', 'Lewandowska', 'student')
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

-- Upewnij się, że admin ma role admin (trigger domyślnie ustawia student)
UPDATE public.users SET role = 'admin' WHERE id = '11111111-1111-1111-1111-111111111101';

-- =============================================================================
-- 4. ZAMÓWIENIA I ORDER_ITEMS (studenci z zakupionymi kursami)
-- =============================================================================

-- Pobierz ID pierwszych itemów kursów (do course_progress)
-- Używamy stałych ID z course_items – w naszym seedzie pierwsze itemy mają znane section_id.
-- Dla uproszczenia zamówienia tworzymy bez polegania na konkretnych item_id – course_progress dodamy osobno z wybranymi itemami.

-- Jan (student1): 2 kursy, jedno zamówienie z kuponem
INSERT INTO orders (id, user_id, status, subtotal_amount, discount_amount, total_amount, coupon_id, payment_intent_id)
VALUES (
  'd0000001-0001-4000-8000-000000000001',
  '11111111-1111-1111-1111-111111111102',
  'paid',
  49800,
  9960,
  39840,
  'c0000001-0001-4000-8000-000000000001',
  'pi_test_jan_1'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, course_id, title, price, quantity)
VALUES
  ('d0000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000001', 'React od zera – kompletny kurs', 29900, 1),
  ('d0000001-0001-4000-8000-000000000001', 'a0000001-0001-4000-8000-000000000002', 'TypeScript dla każdego', 19900, 1);

-- Anna (student2): 3 kursy, dwa zamówienia (jedno z MINUS50)
INSERT INTO orders (id, user_id, status, subtotal_amount, discount_amount, total_amount, coupon_id, payment_intent_id)
VALUES
  ('d0000001-0001-4000-8000-000000000002', '11111111-1111-1111-1111-111111111103', 'paid', 39900, 0, 39900, NULL, 'pi_test_anna_1'),
  ('d0000001-0001-4000-8000-000000000003', '11111111-1111-1111-1111-111111111103', 'paid', 24900, 5000, 19900, 'c0000001-0001-4000-8000-000000000002', 'pi_test_anna_2')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, course_id, title, price, quantity)
VALUES
  ('d0000001-0001-4000-8000-000000000002', 'a0000001-0001-4000-8000-000000000003', 'Next.js 14 – pełny stack', 39900, 1),
  ('d0000001-0001-4000-8000-000000000003', 'a0000001-0001-4000-8000-000000000005', 'Node.js i REST API', 24900, 1);

-- Piotr (student3): 1 kurs
INSERT INTO orders (id, user_id, status, subtotal_amount, discount_amount, total_amount, coupon_id, payment_intent_id)
VALUES ('d0000001-0001-4000-8000-000000000004', '11111111-1111-1111-1111-111111111104', 'paid', 19900, 0, 19900, NULL, 'pi_test_piotr_1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, course_id, title, price, quantity)
VALUES ('d0000001-0001-4000-8000-000000000004', 'a0000001-0001-4000-8000-000000000002', 'TypeScript dla każdego', 19900, 1);

-- Maria (student4): bez zakupów (do testów pustego dashboardu / zachęty do zakupu)
-- (brak zamówień)

-- =============================================================================
-- 5. COUPON_USAGE (powiązanie użyć kuponów z zamówieniami)
-- =============================================================================

INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount)
VALUES
  ('c0000001-0001-4000-8000-000000000001', '11111111-1111-1111-1111-111111111102', 'd0000001-0001-4000-8000-000000000001', 9960),
  ('c0000001-0001-4000-8000-000000000002', '11111111-1111-1111-1111-111111111103', 'd0000001-0001-4000-8000-000000000003', 5000)
ON CONFLICT (coupon_id, order_id) DO NOTHING;

-- =============================================================================
-- 6. COURSE_PROGRESS (postępy w kursach)
-- =============================================================================
-- Używamy istniejących course_items – potrzebujemy ich id. Pobierzemy je po section_id.

DO $$
DECLARE
  v_item_ids UUID[];
  v_item_id UUID;
  i INT;
BEGIN
  -- Jan: React – ukończone 2 pierwsze lekcje (items z pierwszej sekcji)
  SELECT ARRAY_AGG(id ORDER BY position) INTO v_item_ids
  FROM course_items
  WHERE section_id = 'b0000001-0001-4000-8000-000000000001';
  IF v_item_ids IS NOT NULL AND array_length(v_item_ids, 1) >= 2 THEN
    FOR i IN 1..2 LOOP
      INSERT INTO course_progress (user_id, course_id, item_id, completed, last_watched)
      VALUES (
        '11111111-1111-1111-1111-111111111102',
        'a0000001-0001-4000-8000-000000000001',
        v_item_ids[i],
        true,
        NOW()
      )
      ON CONFLICT (user_id, item_id) DO UPDATE SET completed = true, last_watched = NOW();
    END LOOP;
  END IF;

  -- Jan: TypeScript – jedna lekcja ukończona
  SELECT id INTO v_item_id FROM course_items WHERE section_id = 'b0000002-0001-4000-8000-000000000001' AND position = 0 LIMIT 1;
  IF v_item_id IS NOT NULL THEN
    INSERT INTO course_progress (user_id, course_id, item_id, completed, last_watched)
    VALUES ('11111111-1111-1111-1111-111111111102', 'a0000001-0001-4000-8000-000000000002', v_item_id, true, NOW())
    ON CONFLICT (user_id, item_id) DO UPDATE SET completed = true, last_watched = NOW();
  END IF;

  -- Anna: Next.js – jedna lekcja
  SELECT id INTO v_item_id FROM course_items WHERE section_id = 'b0000003-0001-4000-8000-000000000001' AND position = 0 LIMIT 1;
  IF v_item_id IS NOT NULL THEN
    INSERT INTO course_progress (user_id, course_id, item_id, completed, last_watched)
    VALUES ('11111111-1111-1111-1111-111111111103', 'a0000001-0001-4000-8000-000000000003', v_item_id, true, NOW())
    ON CONFLICT (user_id, item_id) DO UPDATE SET completed = true, last_watched = NOW();
  END IF;

  -- Piotr: TypeScript – bez postępu (0%)
END $$;

-- =============================================================================
-- KONIEC SEED
-- =============================================================================
-- Logowanie testowe:
--   Admin:     admin@test.local       / TestHaslo123!
--   Student 1: student1@test.local    / TestHaslo123!  (React + TypeScript, postępy)
--   Student 2: student2@test.local    / TestHaslo123!  (Next.js + Node.js, 1 lekcja)
--   Student 3: student3@test.local    / TestHaslo123!  (TypeScript)
--   Student 4: student4@test.local     / TestHaslo123!  (brak zakupów)
