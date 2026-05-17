-- Course access duration and per-purchase expiration snapshot.

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS access_duration_months INTEGER;

UPDATE public.courses
SET access_duration_months = 6
WHERE access_duration_months IS NULL
   OR access_duration_months < 1;

ALTER TABLE public.courses
  ALTER COLUMN access_duration_months SET DEFAULT 6,
  ALTER COLUMN access_duration_months SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'courses_access_duration_months_positive'
      AND conrelid = 'public.courses'::regclass
  ) THEN
    ALTER TABLE public.courses
      ADD CONSTRAINT courses_access_duration_months_positive
      CHECK (access_duration_months > 0);
  END IF;
END $$;

COMMENT ON COLUMN public.courses.access_duration_months IS
  'Number of months of student access granted by a new purchase of this course.';

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS access_duration_months INTEGER,
  ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMP WITH TIME ZONE;

UPDATE public.order_items AS oi
SET access_duration_months = COALESCE(c.access_duration_months, 6)
FROM public.courses AS c
WHERE oi.course_id = c.id
  AND (oi.access_duration_months IS NULL OR oi.access_duration_months < 1);

UPDATE public.order_items
SET access_duration_months = 6
WHERE access_duration_months IS NULL
   OR access_duration_months < 1;

UPDATE public.order_items
SET access_expires_at =
  COALESCE(created_at, NOW()) + make_interval(months => access_duration_months)
WHERE access_expires_at IS NULL;

ALTER TABLE public.order_items
  ALTER COLUMN access_duration_months SET DEFAULT 6,
  ALTER COLUMN access_duration_months SET NOT NULL,
  ALTER COLUMN access_expires_at SET DEFAULT (NOW() + INTERVAL '6 months'),
  ALTER COLUMN access_expires_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'order_items_access_duration_months_positive'
      AND conrelid = 'public.order_items'::regclass
  ) THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_access_duration_months_positive
      CHECK (access_duration_months > 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_order_items_course_access_expires_at
  ON public.order_items(course_id, access_expires_at);

COMMENT ON COLUMN public.order_items.access_duration_months IS
  'Snapshot of the course access duration in months at purchase time.';

COMMENT ON COLUMN public.order_items.access_expires_at IS
  'Timestamp when this purchased course access expires.';

DROP POLICY IF EXISTS "Users can manage own progress" ON public.course_progress;
DROP POLICY IF EXISTS "Users can view own progress" ON public.course_progress;
DROP POLICY IF EXISTS "Users can insert own progress with active access" ON public.course_progress;
DROP POLICY IF EXISTS "Users can update own progress with active access" ON public.course_progress;
DROP POLICY IF EXISTS "Users can delete own progress with active access" ON public.course_progress;

CREATE POLICY "Users can view own progress" ON public.course_progress
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR (SELECT public.current_user_role() = 'admin')
  );

CREATE POLICY "Users can insert own progress with active access" ON public.course_progress
  FOR INSERT
  WITH CHECK (
    (
      auth.uid() = user_id
      AND EXISTS (
        SELECT 1
        FROM public.orders AS o
        JOIN public.order_items AS oi ON oi.order_id = o.id
        WHERE o.user_id = auth.uid()
          AND o.status = 'paid'
          AND oi.course_id = course_progress.course_id
          AND oi.access_expires_at > NOW()
      )
    )
    OR (SELECT public.current_user_role() = 'admin')
  );

CREATE POLICY "Users can update own progress with active access" ON public.course_progress
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (SELECT public.current_user_role() = 'admin')
  )
  WITH CHECK (
    (
      auth.uid() = user_id
      AND EXISTS (
        SELECT 1
        FROM public.orders AS o
        JOIN public.order_items AS oi ON oi.order_id = o.id
        WHERE o.user_id = auth.uid()
          AND o.status = 'paid'
          AND oi.course_id = course_progress.course_id
          AND oi.access_expires_at > NOW()
      )
    )
    OR (SELECT public.current_user_role() = 'admin')
  );

CREATE POLICY "Users can delete own progress with active access" ON public.course_progress
  FOR DELETE
  USING (
    (
      auth.uid() = user_id
      AND EXISTS (
        SELECT 1
        FROM public.orders AS o
        JOIN public.order_items AS oi ON oi.order_id = o.id
        WHERE o.user_id = auth.uid()
          AND o.status = 'paid'
          AND oi.course_id = course_progress.course_id
          AND oi.access_expires_at > NOW()
      )
    )
    OR (SELECT public.current_user_role() = 'admin')
  );
