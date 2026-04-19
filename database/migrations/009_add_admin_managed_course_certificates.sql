-- Admin-controlled certificate grants for students and courses.

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

CREATE TABLE IF NOT EXISTS public.course_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_certificates_user_id
  ON public.course_certificates(user_id);

CREATE INDEX IF NOT EXISTS idx_course_certificates_course_id
  ON public.course_certificates(course_id);

ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Course certificates viewable by owner or admin"
  ON public.course_certificates;
CREATE POLICY "Course certificates viewable by owner or admin"
  ON public.course_certificates
  FOR SELECT
  USING (auth.uid() = user_id OR (SELECT public.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can modify course certificates"
  ON public.course_certificates;
CREATE POLICY "Only admins can modify course certificates"
  ON public.course_certificates
  FOR ALL
  USING ((SELECT public.current_user_role() = 'admin'))
  WITH CHECK ((SELECT public.current_user_role() = 'admin'));
