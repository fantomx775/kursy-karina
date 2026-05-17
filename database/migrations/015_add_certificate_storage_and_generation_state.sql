-- Stores certificate templates in Supabase Storage and generated certificates
-- as immutable per-student/per-course files.

CREATE TABLE IF NOT EXISTS public.certificate_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'certificates',
  storage_path TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT certificate_templates_id_nonempty CHECK (length(trim(id)) > 0),
  CONSTRAINT certificate_templates_name_nonempty CHECK (length(trim(name)) > 0),
  CONSTRAINT certificate_templates_storage_path_nonempty CHECK (length(trim(storage_path)) > 0)
);

DROP TRIGGER IF EXISTS update_certificate_templates_timestamp
  ON public.certificate_templates;
CREATE TRIGGER update_certificate_templates_timestamp
  BEFORE UPDATE ON public.certificate_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

INSERT INTO public.certificate_templates (id, name, storage_path)
VALUES
  ('certificate-1', 'Certyfikat 1 - laminacja brwi', 'templates/certificate-1.pdf'),
  ('certificate-2', 'Certyfikat 2 - koloryzacja brwi', 'templates/certificate-2.pdf')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    storage_path = EXCLUDED.storage_path,
    is_active = TRUE,
    updated_at = NOW();

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'certificates',
  'certificates',
  FALSE,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS certificate_template_key TEXT;

UPDATE public.courses
SET certificate_template_key = 'certificate-1'
WHERE certificate_template_key IS NULL
   OR length(trim(certificate_template_key)) = 0;

ALTER TABLE public.courses
  ALTER COLUMN certificate_template_key SET DEFAULT 'certificate-1',
  ALTER COLUMN certificate_template_key SET NOT NULL;

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS certificate_template_id TEXT;

UPDATE public.courses
SET certificate_template_id =
  CASE
    WHEN certificate_template_key IN ('certificate-1', 'certificate-2')
      THEN certificate_template_key
    ELSE 'certificate-1'
  END
WHERE certificate_template_id IS NULL
   OR certificate_template_id NOT IN (
     SELECT id FROM public.certificate_templates
   );

ALTER TABLE public.courses
  ALTER COLUMN certificate_template_id SET DEFAULT 'certificate-1',
  ALTER COLUMN certificate_template_id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'courses_certificate_template_id_fkey'
      AND conrelid = 'public.courses'::regclass
  ) THEN
    ALTER TABLE public.courses
      ADD CONSTRAINT courses_certificate_template_id_fkey
      FOREIGN KEY (certificate_template_id)
      REFERENCES public.certificate_templates(id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  END IF;
END $$;

ALTER TABLE public.course_certificates
  ADD COLUMN IF NOT EXISTS recipient_first_name TEXT,
  ADD COLUMN IF NOT EXISTS recipient_last_name TEXT,
  ADD COLUMN IF NOT EXISTS issued_at DATE,
  ADD COLUMN IF NOT EXISTS generated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS pdf_storage_bucket TEXT NOT NULL DEFAULT 'certificates',
  ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS certificate_template_id TEXT,
  ADD COLUMN IF NOT EXISTS regeneration_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS regeneration_allowed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS generation_version INTEGER NOT NULL DEFAULT 0;

UPDATE public.course_certificates AS cc
SET certificate_template_id = c.certificate_template_id
FROM public.courses AS c
WHERE cc.course_id = c.id
  AND cc.certificate_template_id IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'course_certificates_certificate_template_id_fkey'
      AND conrelid = 'public.course_certificates'::regclass
  ) THEN
    ALTER TABLE public.course_certificates
      ADD CONSTRAINT course_certificates_certificate_template_id_fkey
      FOREIGN KEY (certificate_template_id)
      REFERENCES public.certificate_templates(id)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'course_certificates_generation_version_nonnegative'
      AND conrelid = 'public.course_certificates'::regclass
  ) THEN
    ALTER TABLE public.course_certificates
      ADD CONSTRAINT course_certificates_generation_version_nonnegative
      CHECK (generation_version >= 0);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_course_certificates_pdf_storage_path
  ON public.course_certificates(pdf_storage_bucket, pdf_storage_path)
  WHERE pdf_storage_path IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_course_certificates_generated_at
  ON public.course_certificates(generated_at);

CREATE INDEX IF NOT EXISTS idx_course_certificates_certificate_template_id
  ON public.course_certificates(certificate_template_id);

CREATE INDEX IF NOT EXISTS idx_courses_certificate_template_id
  ON public.courses(certificate_template_id);

ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Certificate templates viewable by admins"
  ON public.certificate_templates;
CREATE POLICY "Certificate templates viewable by admins"
  ON public.certificate_templates
  FOR SELECT
  USING ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can modify certificate templates"
  ON public.certificate_templates;
CREATE POLICY "Only admins can insert certificate templates"
  ON public.certificate_templates
  FOR INSERT
  WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));

CREATE POLICY "Only admins can update certificate templates"
  ON public.certificate_templates
  FOR UPDATE
  USING ((SELECT app_private.current_user_role() = 'admin'))
  WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));

CREATE POLICY "Only admins can delete certificate templates"
  ON public.certificate_templates
  FOR DELETE
  USING ((SELECT app_private.current_user_role() = 'admin'));

DROP POLICY IF EXISTS "Only admins can manage certificate storage"
  ON storage.objects;
CREATE POLICY "Only admins can manage certificate storage"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'certificates'
    AND (SELECT app_private.current_user_role() = 'admin')
  )
  WITH CHECK (
    bucket_id = 'certificates'
    AND (SELECT app_private.current_user_role() = 'admin')
  );

COMMENT ON TABLE public.certificate_templates IS
  'Admin-managed certificate PDF templates stored in Supabase Storage.';
COMMENT ON COLUMN public.courses.certificate_template_id IS
  'Stable certificate template id used for PDF generation.';
COMMENT ON COLUMN public.course_certificates.generated_at IS
  'Timestamp when the student generated the immutable certificate PDF.';
COMMENT ON COLUMN public.course_certificates.regeneration_allowed IS
  'Allows exactly one replacement generation after an admin-approved correction.';
