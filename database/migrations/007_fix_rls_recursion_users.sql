-- Fix: "infinite recursion detected in policy for relation users"
-- Policies that use EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
-- cause recursion because evaluating users RLS again queries users.
-- Solution: SECURITY DEFINER function reads role without going through RLS.

-- 1) Helper: current user's role (no RLS recursion)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

-- 2) Drop and recreate all policies that referenced users (to use the function)

-- users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id OR (SELECT public.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id OR (SELECT public.current_user_role() = 'admin'));

-- courses
DROP POLICY IF EXISTS "Only admins can modify courses" ON public.courses;
CREATE POLICY "Only admins can modify courses" ON public.courses
  FOR ALL USING ((SELECT public.current_user_role() = 'admin'));

-- course_sections
DROP POLICY IF EXISTS "Only admins can modify course sections" ON public.course_sections;
CREATE POLICY "Only admins can modify course sections" ON public.course_sections
  FOR ALL USING ((SELECT public.current_user_role() = 'admin'));

-- course_items
DROP POLICY IF EXISTS "Only admins can modify course items" ON public.course_items;
CREATE POLICY "Only admins can modify course items" ON public.course_items
  FOR ALL USING ((SELECT public.current_user_role() = 'admin'));

-- orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR (SELECT public.current_user_role() = 'admin'));

-- order_items
DROP POLICY IF EXISTS "Order items viewable by owner" ON public.order_items;
CREATE POLICY "Order items viewable by owner" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
    OR (SELECT public.current_user_role() = 'admin')
  );

-- course_progress
DROP POLICY IF EXISTS "Users can manage own progress" ON public.course_progress;
CREATE POLICY "Users can manage own progress" ON public.course_progress
  FOR ALL USING (auth.uid() = user_id OR (SELECT public.current_user_role() = 'admin'));

-- coupons
DROP POLICY IF EXISTS "Only admins can modify coupons" ON public.coupons;
CREATE POLICY "Only admins can modify coupons" ON public.coupons
  FOR ALL USING ((SELECT public.current_user_role() = 'admin'));

-- coupon_usage
DROP POLICY IF EXISTS "Coupon usage viewable by owner or admin" ON public.coupon_usage;
CREATE POLICY "Coupon usage viewable by owner or admin" ON public.coupon_usage
  FOR SELECT USING (auth.uid() = user_id OR (SELECT public.current_user_role() = 'admin'));
