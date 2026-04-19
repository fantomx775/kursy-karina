-- =============================================================================
-- Kursy App Modern – PEŁNY SCHEMAT (wszystko w jednym pliku)
-- Idempotentny: można uruchamiać wielokrotnie (najpierw DROP, potem CREATE).
-- Po uruchomieniu odpal seed_test_data.sql, jeśli chcesz dane testowe.
-- =============================================================================

-- ================================
-- CZĘŚĆ 1: DROP (odwrotna kolejność zależności)
-- ================================

-- Trigger na auth.users (poza public)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Tabele (kolejność: najpierw zależne, na końcu niezależne)
DROP TABLE IF EXISTS public.coupon_usage CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.course_certificates CASCADE;
DROP TABLE IF EXISTS public.course_progress CASCADE;
DROP TABLE IF EXISTS public.course_items CASCADE;
DROP TABLE IF EXISTS public.course_sections CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Funkcje RPC (używają typów enum)
DROP FUNCTION IF EXISTS public.create_course_with_content(TEXT, TEXT, TEXT, INTEGER, course_status, JSONB, discount_type, INTEGER, TIMESTAMPTZ, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS public.update_course_with_content(UUID, TEXT, TEXT, TEXT, INTEGER, course_status, JSONB, discount_type, INTEGER, TIMESTAMPTZ, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.update_timestamp() CASCADE;

-- Typy enum (dopiero po usunięciu tabel i funkcji)
DROP TYPE IF EXISTS public.course_item_kind CASCADE;
DROP TYPE IF EXISTS public.discount_type CASCADE;
DROP TYPE IF EXISTS public.course_status CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;

-- Polityki Storage (żeby można było je ponownie utworzyć)
DROP POLICY IF EXISTS "Public course assets are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload course assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own course assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own course assets" ON storage.objects;

-- ================================
-- CZĘŚĆ 2: CREATE
-- ================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- ENUMS
-- ================================
CREATE TYPE user_role AS ENUM ('admin', 'student');
CREATE TYPE course_status AS ENUM ('active', 'inactive');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
CREATE TYPE course_item_kind AS ENUM ('svg', 'youtube', 'quiz');

-- ================================
-- FUNCTIONS
-- ================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  first_name_part TEXT;
  last_name_part TEXT;
BEGIN
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  IF user_name IS NULL OR user_name = '' THEN
    first_name_part := split_part(NEW.email, '@', 1);
    last_name_part := 'User';
  ELSE
    first_name_part := split_part(user_name, ' ', 1);
    last_name_part := COALESCE(NULLIF(substring(user_name from position(' ' in user_name) + 1), ''), 'User');

    IF first_name_part = user_name THEN
      last_name_part := 'User';
    END IF;
  END IF;

  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(first_name_part, ''), 'User'),
    COALESCE(NULLIF(last_name_part, ''), 'User'),
    'student'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

-- ================================
-- TABLES
-- ================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  status course_status NOT NULL DEFAULT 'inactive',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  main_image_url TEXT,
  promotion_discount_type discount_type,
  promotion_discount_value INTEGER,
  promotion_start_date TIMESTAMP WITH TIME ZONE,
  promotion_end_date TIMESTAMP WITH TIME ZONE,
  CONSTRAINT courses_promotion_check CHECK (
    (
      promotion_discount_type IS NULL
      AND promotion_discount_value IS NULL
      AND promotion_start_date IS NULL
      AND promotion_end_date IS NULL
    )
    OR (
      promotion_discount_type IS NOT NULL
      AND promotion_discount_value IS NOT NULL
      AND promotion_start_date IS NOT NULL
      AND (
        (promotion_discount_type = 'percentage' AND promotion_discount_value BETWEEN 1 AND 100)
        OR (promotion_discount_type = 'fixed' AND promotion_discount_value >= 0)
      )
    )
  )
);

COMMENT ON COLUMN courses.main_image_url IS 'URL of the main course image displayed on course cards and detail pages';
COMMENT ON COLUMN courses.promotion_discount_type IS 'Promotion discount type: percentage or fixed amount';
COMMENT ON COLUMN courses.promotion_discount_value IS 'Promotion value: 1-100 for percentage, amount in grosze for fixed';
COMMENT ON COLUMN courses.promotion_start_date IS 'Promotion valid from (inclusive)';
COMMENT ON COLUMN courses.promotion_end_date IS 'Promotion valid until (inclusive), NULL = no end';

CREATE TABLE course_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, position)
);

CREATE TABLE course_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  kind course_item_kind NOT NULL,
  asset_path TEXT,
  youtube_url TEXT,
  quiz_data JSONB,
  position INTEGER NOT NULL,
  is_preview BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(section_id, position),
  CONSTRAINT course_items_kind_payload_check CHECK (
    (
      kind = 'svg'
      AND asset_path IS NOT NULL
      AND youtube_url IS NULL
      AND quiz_data IS NULL
    )
    OR (
      kind = 'youtube'
      AND youtube_url IS NOT NULL
      AND asset_path IS NULL
      AND quiz_data IS NULL
    )
    OR (
      kind = 'quiz'
      AND quiz_data IS NOT NULL
      AND asset_path IS NULL
      AND youtube_url IS NULL
      AND jsonb_typeof(quiz_data) = 'object'
      AND jsonb_typeof(COALESCE(quiz_data -> 'questions', '[]'::jsonb)) = 'array'
    )
  )
);

COMMENT ON COLUMN course_items.quiz_data IS 'Quiz definition stored inline for lesson items';

CREATE TABLE course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES course_items(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  last_watched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

CREATE TABLE course_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  discount_type discount_type NOT NULL DEFAULT 'percentage',
  discount_value INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  usage_limit_per_user INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal_amount INTEGER NOT NULL,
  discount_amount INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL,
  coupon_id UUID REFERENCES coupons(id),
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount INTEGER NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_id, order_id)
);

-- ================================
-- INDEXES
-- ================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_course_sections_course_id ON course_sections(course_id);
CREATE INDEX idx_course_items_section_id ON course_items(section_id);
CREATE INDEX idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX idx_course_progress_course_id ON course_progress(course_id);
CREATE INDEX idx_course_certificates_user_id ON course_certificates(user_id);
CREATE INDEX idx_course_certificates_course_id ON course_certificates(course_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_course_id ON order_items(course_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);

-- ================================
-- TRIGGERS
-- ================================
CREATE TRIGGER update_users_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_courses_timestamp
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_course_sections_timestamp
  BEFORE UPDATE ON course_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_course_items_timestamp
  BEFORE UPDATE ON course_items
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_course_progress_timestamp
  BEFORE UPDATE ON course_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_orders_timestamp
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_coupons_timestamp
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ================================
-- RLS
-- ================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id OR (SELECT current_user_role() = 'admin'));

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id OR (SELECT current_user_role() = 'admin'));

CREATE POLICY "Courses are viewable by everyone" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify courses" ON courses
  FOR ALL USING ((SELECT current_user_role() = 'admin'));

CREATE POLICY "Course sections viewable by everyone" ON course_sections
  FOR SELECT USING (true);

CREATE POLICY "Course items viewable by everyone" ON course_items
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify course sections" ON course_sections
  FOR ALL USING ((SELECT current_user_role() = 'admin'));

CREATE POLICY "Only admins can modify course items" ON course_items
  FOR ALL USING ((SELECT current_user_role() = 'admin'));

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id OR (SELECT current_user_role() = 'admin'));

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Order items viewable by owner" ON order_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()
  ) OR (SELECT current_user_role() = 'admin'));

CREATE POLICY "Users can manage own progress" ON course_progress
  FOR ALL USING (auth.uid() = user_id OR (SELECT current_user_role() = 'admin'));

CREATE POLICY "Course certificates viewable by owner or admin" ON course_certificates
  FOR SELECT USING (auth.uid() = user_id OR (SELECT current_user_role() = 'admin'));

CREATE POLICY "Only admins can modify course certificates" ON course_certificates
  FOR ALL
  USING ((SELECT current_user_role() = 'admin'))
  WITH CHECK ((SELECT current_user_role() = 'admin'));

CREATE POLICY "Coupons viewable by everyone" ON coupons
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify coupons" ON coupons
  FOR ALL USING ((SELECT current_user_role() = 'admin'));

CREATE POLICY "Coupon usage viewable by owner or admin" ON coupon_usage
  FOR SELECT USING (auth.uid() = user_id OR (SELECT current_user_role() = 'admin'));

CREATE POLICY "Coupon usage insert by owner" ON coupon_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================
-- RPC: create_course_with_content
-- ================================
CREATE OR REPLACE FUNCTION create_course_with_content(
  p_title TEXT,
  p_slug TEXT,
  p_description TEXT,
  p_price INTEGER,
  p_status course_status,
  p_sections JSONB,
  p_promotion_discount_type discount_type DEFAULT NULL,
  p_promotion_discount_value INTEGER DEFAULT NULL,
  p_promotion_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_promotion_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  course_id UUID,
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_course_id UUID;
  v_section_id UUID;
  v_section_data JSONB;
  v_item_data JSONB;
  v_items JSONB;
  v_sections JSONB;
  v_section_index INTEGER;
  v_item_index INTEGER;
BEGIN
  v_sections := COALESCE(p_sections, '[]'::jsonb);
  IF jsonb_typeof(v_sections) != 'array' THEN
    v_sections := '[]'::jsonb;
  END IF;

  IF EXISTS (SELECT 1 FROM courses WHERE slug = p_slug) THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Slug already exists'::TEXT;
    RETURN;
  END IF;

  INSERT INTO courses (
    title, slug, description, price, status,
    promotion_discount_type, promotion_discount_value, promotion_start_date, promotion_end_date
  )
  VALUES (
    p_title, p_slug, p_description, p_price, p_status,
    p_promotion_discount_type, p_promotion_discount_value, p_promotion_start_date, p_promotion_end_date
  )
  RETURNING id INTO v_course_id;

  IF v_course_id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Failed to create course'::TEXT;
    RETURN;
  END IF;

  FOR v_section_index IN 0..jsonb_array_length(v_sections) - 1 LOOP
    v_section_data := v_sections -> v_section_index;

    INSERT INTO course_sections (course_id, title, position)
    VALUES (v_course_id, v_section_data ->> 'title', v_section_index)
    RETURNING id INTO v_section_id;

    IF v_section_id IS NULL THEN
      DELETE FROM courses WHERE id = v_course_id;
      RETURN QUERY SELECT NULL::UUID, FALSE, 'Failed to create section'::TEXT;
      RETURN;
    END IF;

    v_items := v_section_data -> 'items';
    IF v_items IS NULL OR jsonb_typeof(v_items) != 'array' THEN
      v_items := '[]'::jsonb;
    END IF;

    FOR v_item_index IN 0..jsonb_array_length(v_items) - 1 LOOP
      v_item_data := v_items -> v_item_index;

      INSERT INTO course_items (
        section_id,
        title,
        kind,
        asset_path,
        youtube_url,
        quiz_data,
        position,
        is_preview
      )
      VALUES (
        v_section_id,
        v_item_data ->> 'title',
        (v_item_data ->> 'kind')::course_item_kind,
        CASE WHEN v_item_data ->> 'kind' = 'svg'
             THEN v_item_data ->> 'assetPath'
             ELSE NULL
        END,
        CASE WHEN v_item_data ->> 'kind' = 'youtube'
             THEN v_item_data ->> 'youtubeUrl'
             ELSE NULL
        END,
        CASE WHEN v_item_data ->> 'kind' = 'quiz'
             THEN v_item_data -> 'quizData'
             ELSE NULL
        END,
        v_item_index,
        COALESCE((v_item_data ->> 'isPreview')::BOOLEAN, FALSE)
      );

      IF NOT FOUND THEN
        DELETE FROM courses WHERE id = v_course_id;
        RETURN QUERY SELECT NULL::UUID, FALSE, 'Failed to create item'::TEXT;
        RETURN;
      END IF;
    END LOOP;
  END LOOP;

  RETURN QUERY SELECT v_course_id, TRUE, NULL::TEXT;
END;
$$;

-- ================================
-- RPC: update_course_with_content
-- ================================
CREATE OR REPLACE FUNCTION update_course_with_content(
  p_course_id UUID,
  p_title TEXT,
  p_slug TEXT,
  p_description TEXT,
  p_price INTEGER,
  p_status course_status,
  p_sections JSONB,
  p_promotion_discount_type discount_type DEFAULT NULL,
  p_promotion_discount_value INTEGER DEFAULT NULL,
  p_promotion_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_promotion_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  course_id UUID,
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_section_id UUID;
  v_section_data JSONB;
  v_item_data JSONB;
  v_items JSONB;
  v_sections JSONB;
  v_section_index INTEGER;
  v_item_index INTEGER;
  v_existing_course_id UUID;
BEGIN
  v_sections := COALESCE(p_sections, '[]'::jsonb);
  IF jsonb_typeof(v_sections) != 'array' THEN
    v_sections := '[]'::jsonb;
  END IF;

  SELECT id INTO v_existing_course_id
  FROM courses
  WHERE slug = p_slug AND id != p_course_id;

  IF v_existing_course_id IS NOT NULL THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Slug already exists'::TEXT;
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM courses WHERE id = p_course_id) THEN
    RETURN QUERY SELECT NULL::UUID, FALSE, 'Course not found'::TEXT;
    RETURN;
  END IF;

  UPDATE courses
  SET title = p_title,
      slug = p_slug,
      description = p_description,
      price = p_price,
      status = p_status,
      promotion_discount_type = p_promotion_discount_type,
      promotion_discount_value = p_promotion_discount_value,
      promotion_start_date = p_promotion_start_date,
      promotion_end_date = p_promotion_end_date
  WHERE id = p_course_id;

  DELETE FROM course_sections AS cs WHERE cs.course_id = p_course_id;

  FOR v_section_index IN 0..jsonb_array_length(v_sections) - 1 LOOP
    v_section_data := v_sections -> v_section_index;

    INSERT INTO course_sections (course_id, title, position)
    VALUES (p_course_id, v_section_data ->> 'title', v_section_index)
    RETURNING id INTO v_section_id;

    IF v_section_id IS NULL THEN
      RETURN QUERY SELECT NULL::UUID, FALSE, 'Failed to create section'::TEXT;
      RETURN;
    END IF;

    v_items := v_section_data -> 'items';
    IF v_items IS NULL OR jsonb_typeof(v_items) != 'array' THEN
      v_items := '[]'::jsonb;
    END IF;

    FOR v_item_index IN 0..jsonb_array_length(v_items) - 1 LOOP
      v_item_data := v_items -> v_item_index;

      INSERT INTO course_items (
        section_id,
        title,
        kind,
        asset_path,
        youtube_url,
        quiz_data,
        position,
        is_preview
      )
      VALUES (
        v_section_id,
        v_item_data ->> 'title',
        (v_item_data ->> 'kind')::course_item_kind,
        CASE WHEN v_item_data ->> 'kind' = 'svg'
             THEN v_item_data ->> 'assetPath'
             ELSE NULL
        END,
        CASE WHEN v_item_data ->> 'kind' = 'youtube'
             THEN v_item_data ->> 'youtubeUrl'
             ELSE NULL
        END,
        CASE WHEN v_item_data ->> 'kind' = 'quiz'
             THEN v_item_data -> 'quizData'
             ELSE NULL
        END,
        v_item_index,
        COALESCE((v_item_data ->> 'isPreview')::BOOLEAN, FALSE)
      );

      IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID, FALSE, 'Failed to create item'::TEXT;
        RETURN;
      END IF;
    END LOOP;
  END LOOP;

  RETURN QUERY SELECT p_course_id, TRUE, NULL::TEXT;
END;
$$;

-- ================================
-- STORAGE: bucket course-assets
-- ================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-assets', 'course-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public course assets are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-assets');

CREATE POLICY "Authenticated users can upload course assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-assets'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own course assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-assets'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own course assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-assets'
  AND auth.role() = 'authenticated'
);

GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
