CREATE INDEX IF NOT EXISTS idx_coupon_usage_order_id ON public.coupon_usage(order_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON public.coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_course_certificates_granted_by ON public.course_certificates(granted_by);
CREATE INDEX IF NOT EXISTS idx_course_progress_item_id ON public.course_progress(item_id);
CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON public.orders(coupon_id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING ((SELECT auth.uid()) = id OR (SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING ((SELECT auth.uid()) = id OR (SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can modify courses" ON public.courses;
CREATE POLICY "Only admins can insert courses" ON public.courses
  FOR INSERT WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));
CREATE POLICY "Only admins can update courses" ON public.courses
  FOR UPDATE USING ((SELECT app_private.current_user_role() = 'admin'))
  WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));
CREATE POLICY "Only admins can delete courses" ON public.courses
  FOR DELETE USING ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can modify course sections" ON public.course_sections;
CREATE POLICY "Only admins can insert course sections" ON public.course_sections
  FOR INSERT WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));
CREATE POLICY "Only admins can update course sections" ON public.course_sections
  FOR UPDATE USING ((SELECT app_private.current_user_role() = 'admin'))
  WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));
CREATE POLICY "Only admins can delete course sections" ON public.course_sections
  FOR DELETE USING ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can modify course items" ON public.course_items;
CREATE POLICY "Only admins can insert course items" ON public.course_items
  FOR INSERT WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));
CREATE POLICY "Only admins can update course items" ON public.course_items
  FOR UPDATE USING ((SELECT app_private.current_user_role() = 'admin'))
  WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));
CREATE POLICY "Only admins can delete course items" ON public.course_items
  FOR DELETE USING ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING ((SELECT auth.uid()) = user_id OR (SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Order items viewable by owner" ON public.order_items;
CREATE POLICY "Order items viewable by owner" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = (SELECT auth.uid()))
    OR (SELECT app_private.current_user_role() = 'admin')
  );

DROP POLICY IF EXISTS "Users can manage own progress" ON public.course_progress;
CREATE POLICY "Users can manage own progress" ON public.course_progress
  FOR ALL USING ((SELECT auth.uid()) = user_id OR (SELECT app_private.current_user_role() = 'admin'))
  WITH CHECK ((SELECT auth.uid()) = user_id OR (SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can modify coupons" ON public.coupons;
CREATE POLICY "Only admins can insert coupons" ON public.coupons
  FOR INSERT WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));
CREATE POLICY "Only admins can update coupons" ON public.coupons
  FOR UPDATE USING ((SELECT app_private.current_user_role() = 'admin'))
  WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));
CREATE POLICY "Only admins can delete coupons" ON public.coupons
  FOR DELETE USING ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Coupon usage viewable by owner or admin" ON public.coupon_usage;
CREATE POLICY "Coupon usage viewable by owner or admin" ON public.coupon_usage
  FOR SELECT USING ((SELECT auth.uid()) = user_id OR (SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Coupon usage insert by owner" ON public.coupon_usage;
CREATE POLICY "Coupon usage insert by owner" ON public.coupon_usage
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Course certificates viewable by owner or admin" ON public.course_certificates;
CREATE POLICY "Course certificates viewable by owner or admin" ON public.course_certificates
  FOR SELECT USING ((SELECT auth.uid()) = user_id OR (SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can modify course certificates" ON public.course_certificates;
CREATE POLICY "Only admins can insert course certificates" ON public.course_certificates
  FOR INSERT WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));
CREATE POLICY "Only admins can update course certificates" ON public.course_certificates
  FOR UPDATE USING ((SELECT app_private.current_user_role() = 'admin'))
  WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));
CREATE POLICY "Only admins can delete course certificates" ON public.course_certificates
  FOR DELETE USING ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can upload course assets" ON storage.objects;
CREATE POLICY "Only admins can upload course assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-assets'
  AND (SELECT auth.role()) = 'authenticated'
  AND (SELECT app_private.current_user_role() = 'admin')
);

DROP POLICY IF EXISTS "Only admins can update course assets" ON storage.objects;
CREATE POLICY "Only admins can update course assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-assets'
  AND (SELECT auth.role()) = 'authenticated'
  AND (SELECT app_private.current_user_role() = 'admin')
)
WITH CHECK (
  bucket_id = 'course-assets'
  AND (SELECT auth.role()) = 'authenticated'
  AND (SELECT app_private.current_user_role() = 'admin')
);

DROP POLICY IF EXISTS "Only admins can delete course assets" ON storage.objects;
CREATE POLICY "Only admins can delete course assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-assets'
  AND (SELECT auth.role()) = 'authenticated'
  AND (SELECT app_private.current_user_role() = 'admin')
);
