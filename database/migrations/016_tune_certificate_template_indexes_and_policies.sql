-- Follow-up tuning for certificate template policies and generated certificate FK.

CREATE INDEX IF NOT EXISTS idx_course_certificates_certificate_template_id
  ON public.course_certificates(certificate_template_id);

DROP POLICY IF EXISTS "Only admins can modify certificate templates"
  ON public.certificate_templates;

DROP POLICY IF EXISTS "Only admins can insert certificate templates"
  ON public.certificate_templates;
CREATE POLICY "Only admins can insert certificate templates"
  ON public.certificate_templates
  FOR INSERT
  WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can update certificate templates"
  ON public.certificate_templates;
CREATE POLICY "Only admins can update certificate templates"
  ON public.certificate_templates
  FOR UPDATE
  USING ((SELECT app_private.current_user_role() = 'admin'))
  WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can delete certificate templates"
  ON public.certificate_templates;
CREATE POLICY "Only admins can delete certificate templates"
  ON public.certificate_templates
  FOR DELETE
  USING ((SELECT app_private.current_user_role() = 'admin'));
