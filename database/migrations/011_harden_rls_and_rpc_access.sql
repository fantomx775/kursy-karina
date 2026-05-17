CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

ALTER FUNCTION public.create_course_with_content(
  TEXT, TEXT, TEXT, INTEGER, public.course_status, JSONB, public.discount_type, INTEGER, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE
) SET search_path = public, pg_temp;

ALTER FUNCTION public.update_course_with_content(
  UUID, TEXT, TEXT, TEXT, INTEGER, public.course_status, JSONB, public.discount_type, INTEGER, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE
) SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.create_course_with_content(
  TEXT, TEXT, TEXT, INTEGER, public.course_status, JSONB, public.discount_type, INTEGER, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE
) FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.update_course_with_content(
  UUID, TEXT, TEXT, TEXT, INTEGER, public.course_status, JSONB, public.discount_type, INTEGER, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE
) FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_timestamp() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_course_with_content(
  TEXT, TEXT, TEXT, INTEGER, public.course_status, JSONB, public.discount_type, INTEGER, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE
) TO service_role;

GRANT EXECUTE ON FUNCTION public.update_course_with_content(
  UUID, TEXT, TEXT, TEXT, INTEGER, public.course_status, JSONB, public.discount_type, INTEGER, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE
) TO service_role;

DROP POLICY IF EXISTS "Authenticated users can upload course assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own course assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own course assets" ON storage.objects;

CREATE POLICY "Only admins can upload course assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-assets'
  AND auth.role() = 'authenticated'
  AND (SELECT public.current_user_role() = 'admin')
);

CREATE POLICY "Only admins can update course assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-assets'
  AND auth.role() = 'authenticated'
  AND (SELECT public.current_user_role() = 'admin')
)
WITH CHECK (
  bucket_id = 'course-assets'
  AND auth.role() = 'authenticated'
  AND (SELECT public.current_user_role() = 'admin')
);

CREATE POLICY "Only admins can delete course assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-assets'
  AND auth.role() = 'authenticated'
  AND (SELECT public.current_user_role() = 'admin')
);
