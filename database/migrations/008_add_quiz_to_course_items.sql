ALTER TYPE course_item_kind ADD VALUE IF NOT EXISTS 'quiz';

ALTER TABLE course_items
  ADD COLUMN IF NOT EXISTS quiz_data JSONB;

COMMENT ON COLUMN course_items.quiz_data IS 'Quiz definition stored inline for lesson items.';

ALTER TABLE course_items DROP CONSTRAINT IF EXISTS course_items_check;
ALTER TABLE course_items DROP CONSTRAINT IF EXISTS course_items_kind_payload_check;

ALTER TABLE course_items
  ADD CONSTRAINT course_items_kind_payload_check CHECK (
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
  );

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
