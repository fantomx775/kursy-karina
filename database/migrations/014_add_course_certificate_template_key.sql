-- Stores which bundled PDF certificate template a course should use.
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS certificate_template_key TEXT;

UPDATE public.courses
SET certificate_template_key = 'certificate-1'
WHERE certificate_template_key IS NULL
   OR length(trim(certificate_template_key)) = 0;

ALTER TABLE public.courses
  ALTER COLUMN certificate_template_key SET DEFAULT 'certificate-1',
  ALTER COLUMN certificate_template_key SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'courses_certificate_template_key_nonempty'
  ) THEN
    ALTER TABLE public.courses
      ADD CONSTRAINT courses_certificate_template_key_nonempty
      CHECK (length(trim(certificate_template_key)) > 0);
  END IF;
END $$;

COMMENT ON COLUMN public.courses.certificate_template_key IS
  'Bundled certificate template key used for PDF generation.';
