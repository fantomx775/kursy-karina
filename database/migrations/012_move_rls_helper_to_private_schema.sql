CREATE SCHEMA IF NOT EXISTS app_private;

CREATE OR REPLACE FUNCTION app_private.current_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

GRANT USAGE ON SCHEMA app_private TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.current_user_role() TO anon, authenticated, service_role;

ALTER FUNCTION public.update_timestamp() SET search_path = public, pg_temp;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id OR (SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id OR (SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can modify courses" ON public.courses;
CREATE POLICY "Only admins can modify courses" ON public.courses
  FOR ALL USING ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can modify course sections" ON public.course_sections;
CREATE POLICY "Only admins can modify course sections" ON public.course_sections
  FOR ALL USING ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can modify course items" ON public.course_items;
CREATE POLICY "Only admins can modify course items" ON public.course_items
  FOR ALL USING ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR (SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Order items viewable by owner" ON public.order_items;
CREATE POLICY "Order items viewable by owner" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
    OR (SELECT app_private.current_user_role() = 'admin')
  );

DROP POLICY IF EXISTS "Users can manage own progress" ON public.course_progress;
CREATE POLICY "Users can manage own progress" ON public.course_progress
  FOR ALL USING (auth.uid() = user_id OR (SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can modify coupons" ON public.coupons;
CREATE POLICY "Only admins can modify coupons" ON public.coupons
  FOR ALL USING ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Coupon usage viewable by owner or admin" ON public.coupon_usage;
CREATE POLICY "Coupon usage viewable by owner or admin" ON public.coupon_usage
  FOR SELECT USING (auth.uid() = user_id OR (SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Course certificates viewable by owner or admin" ON public.course_certificates;
CREATE POLICY "Course certificates viewable by owner or admin"
  ON public.course_certificates
  FOR SELECT
  USING (auth.uid() = user_id OR (SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can modify course certificates" ON public.course_certificates;
CREATE POLICY "Only admins can modify course certificates"
  ON public.course_certificates
  FOR ALL
  USING ((SELECT app_private.current_user_role() = 'admin'))
  WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can upload course assets" ON storage.objects;
CREATE POLICY "Only admins can upload course assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-assets'
  AND auth.role() = 'authenticated'
  AND (SELECT app_private.current_user_role() = 'admin')
);

DROP POLICY IF EXISTS "Only admins can update course assets" ON storage.objects;
CREATE POLICY "Only admins can update course assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-assets'
  AND auth.role() = 'authenticated'
  AND (SELECT app_private.current_user_role() = 'admin')
)
WITH CHECK (
  bucket_id = 'course-assets'
  AND auth.role() = 'authenticated'
  AND (SELECT app_private.current_user_role() = 'admin')
);

DROP POLICY IF EXISTS "Only admins can delete course assets" ON storage.objects;
CREATE POLICY "Only admins can delete course assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-assets'
  AND auth.role() = 'authenticated'
  AND (SELECT app_private.current_user_role() = 'admin')
);

DROP POLICY IF EXISTS "Public course assets are viewable by everyone" ON storage.objects;

REVOKE EXECUTE ON FUNCTION public.current_user_role() FROM PUBLIC, anon, authenticated;
