CREATE TABLE IF NOT EXISTS public.coupon_applicable_courses (
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (coupon_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.coupon_required_courses (
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (coupon_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_applicable_courses_course_id
  ON public.coupon_applicable_courses(course_id);

CREATE INDEX IF NOT EXISTS idx_coupon_required_courses_course_id
  ON public.coupon_required_courses(course_id);

ALTER TABLE public.coupon_applicable_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_required_courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Coupon applicable courses viewable by everyone"
  ON public.coupon_applicable_courses;
CREATE POLICY "Coupon applicable courses viewable by everyone"
  ON public.coupon_applicable_courses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can insert coupon applicable courses"
  ON public.coupon_applicable_courses;
CREATE POLICY "Only admins can insert coupon applicable courses"
  ON public.coupon_applicable_courses
  FOR INSERT WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can delete coupon applicable courses"
  ON public.coupon_applicable_courses;
CREATE POLICY "Only admins can delete coupon applicable courses"
  ON public.coupon_applicable_courses
  FOR DELETE USING ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Coupon required courses viewable by everyone"
  ON public.coupon_required_courses;
CREATE POLICY "Coupon required courses viewable by everyone"
  ON public.coupon_required_courses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can insert coupon required courses"
  ON public.coupon_required_courses;
CREATE POLICY "Only admins can insert coupon required courses"
  ON public.coupon_required_courses
  FOR INSERT WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can delete coupon required courses"
  ON public.coupon_required_courses;
CREATE POLICY "Only admins can delete coupon required courses"
  ON public.coupon_required_courses
  FOR DELETE USING ((SELECT app_private.current_user_role() = 'admin'));
