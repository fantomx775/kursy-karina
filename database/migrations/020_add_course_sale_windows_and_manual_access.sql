-- Course sale windows and manually activated access.

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS sale_mode TEXT NOT NULL DEFAULT 'always_open';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'courses_sale_mode_check'
      AND conrelid = 'public.courses'::regclass
  ) THEN
    ALTER TABLE public.courses
      ADD CONSTRAINT courses_sale_mode_check
      CHECK (sale_mode IN ('always_open', 'scheduled'));
  END IF;
END $$;

UPDATE public.courses
SET access_duration_months = 12
WHERE access_duration_months IS DISTINCT FROM 12;

ALTER TABLE public.courses
  ALTER COLUMN access_duration_months SET DEFAULT 12;

COMMENT ON COLUMN public.courses.sale_mode IS
  'Controls whether a published course is always purchasable or only purchasable during configured sale windows.';
COMMENT ON COLUMN public.courses.access_duration_months IS
  'Number of months of student access granted after manual activation.';

CREATE TABLE IF NOT EXISTS public.course_sale_windows (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT course_sale_windows_valid_range CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_course_sale_windows_course_id
  ON public.course_sale_windows(course_id);
CREATE INDEX IF NOT EXISTS idx_course_sale_windows_range
  ON public.course_sale_windows(course_id, starts_at, ends_at);

ALTER TABLE public.course_sale_windows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Course sale windows are viewable for public courses"
  ON public.course_sale_windows;
CREATE POLICY "Course sale windows are viewable for public courses"
  ON public.course_sale_windows
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.courses
      WHERE courses.id = course_sale_windows.course_id
        AND courses.status = 'active'
    )
    OR (SELECT app_private.current_user_role() = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can manage course sale windows"
  ON public.course_sale_windows;
CREATE POLICY "Only admins can manage course sale windows"
  ON public.course_sale_windows
  FOR ALL
  USING ((SELECT app_private.current_user_role() = 'admin'))
  WITH CHECK ((SELECT app_private.current_user_role() = 'admin'));

GRANT SELECT ON public.course_sale_windows TO anon, authenticated;
GRANT ALL ON public.course_sale_windows TO service_role;

DROP TRIGGER IF EXISTS update_course_sale_windows_timestamp
  ON public.course_sale_windows;
CREATE TRIGGER update_course_sale_windows_timestamp
  BEFORE UPDATE ON public.course_sale_windows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS access_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS access_activated_at TIMESTAMPTZ;

UPDATE public.order_items
SET access_status = 'active'
WHERE access_status IS NULL;

UPDATE public.order_items
SET access_activated_at = COALESCE(access_activated_at, created_at, NOW())
WHERE access_status = 'active'
  AND access_activated_at IS NULL;

ALTER TABLE public.order_items
  ALTER COLUMN access_status SET NOT NULL,
  ALTER COLUMN access_status SET DEFAULT 'pending',
  ALTER COLUMN access_duration_months SET DEFAULT 12,
  ALTER COLUMN access_expires_at DROP DEFAULT,
  ALTER COLUMN access_expires_at DROP NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'order_items_access_status_check'
      AND conrelid = 'public.order_items'::regclass
  ) THEN
    ALTER TABLE public.order_items
      DROP CONSTRAINT order_items_access_status_check;
  END IF;

  ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_access_status_check
    CHECK (access_status IN ('pending', 'active', 'revoked'));

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'order_items_active_access_dates_check'
      AND conrelid = 'public.order_items'::regclass
  ) THEN
    ALTER TABLE public.order_items
      DROP CONSTRAINT order_items_active_access_dates_check;
  END IF;

  ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_active_access_dates_check
    CHECK (
      access_status <> 'active'
      OR (
        access_activated_at IS NOT NULL
        AND access_expires_at IS NOT NULL
        AND access_expires_at > access_activated_at
      )
    );

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'order_items_pending_access_dates_check'
      AND conrelid = 'public.order_items'::regclass
  ) THEN
    ALTER TABLE public.order_items
      DROP CONSTRAINT order_items_pending_access_dates_check;
  END IF;

  ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_pending_access_dates_check
    CHECK (
      access_status <> 'pending'
      OR (
        access_activated_at IS NULL
        AND access_expires_at IS NULL
      )
    );
END $$;

CREATE INDEX IF NOT EXISTS idx_order_items_access_status
  ON public.order_items(access_status);
CREATE INDEX IF NOT EXISTS idx_order_items_active_access
  ON public.order_items(course_id, access_status, access_expires_at);

COMMENT ON COLUMN public.order_items.access_status IS
  'Access lifecycle for a purchased course: pending until manually activated, active while usable, revoked when disabled.';
COMMENT ON COLUMN public.order_items.access_activated_at IS
  'Timestamp when an admin manually started the access period.';
COMMENT ON COLUMN public.order_items.access_expires_at IS
  'Timestamp when activated course access expires; NULL while access is pending.';

DROP POLICY IF EXISTS "Users can manage own progress"
  ON public.course_progress;
DROP POLICY IF EXISTS "Users can view own progress"
  ON public.course_progress;
DROP POLICY IF EXISTS "Users can insert own progress with active access"
  ON public.course_progress;
DROP POLICY IF EXISTS "Users can update own progress with active access"
  ON public.course_progress;
DROP POLICY IF EXISTS "Users can delete own progress with active access"
  ON public.course_progress;

CREATE POLICY "Users can view own progress" ON public.course_progress
  FOR SELECT USING (
    (SELECT auth.uid()) = user_id
    OR (SELECT app_private.current_user_role() = 'admin')
  );

CREATE POLICY "Users can insert own progress with active access"
  ON public.course_progress
  FOR INSERT WITH CHECK (
    (
      (SELECT auth.uid()) = user_id
      AND EXISTS (
        SELECT 1
        FROM public.orders AS o
        JOIN public.order_items AS oi ON oi.order_id = o.id
        WHERE o.user_id = (SELECT auth.uid())
          AND o.status = 'paid'
          AND oi.course_id = course_progress.course_id
          AND oi.access_status = 'active'
          AND oi.access_expires_at > NOW()
      )
    )
    OR (SELECT app_private.current_user_role() = 'admin')
  );

CREATE POLICY "Users can update own progress with active access"
  ON public.course_progress
  FOR UPDATE
  USING (
    (SELECT auth.uid()) = user_id
    OR (SELECT app_private.current_user_role() = 'admin')
  )
  WITH CHECK (
    (
      (SELECT auth.uid()) = user_id
      AND EXISTS (
        SELECT 1
        FROM public.orders AS o
        JOIN public.order_items AS oi ON oi.order_id = o.id
        WHERE o.user_id = (SELECT auth.uid())
          AND o.status = 'paid'
          AND oi.course_id = course_progress.course_id
          AND oi.access_status = 'active'
          AND oi.access_expires_at > NOW()
      )
    )
    OR (SELECT app_private.current_user_role() = 'admin')
  );

CREATE POLICY "Users can delete own progress with active access"
  ON public.course_progress
  FOR DELETE USING (
    (
      (SELECT auth.uid()) = user_id
      AND EXISTS (
        SELECT 1
        FROM public.orders AS o
        JOIN public.order_items AS oi ON oi.order_id = o.id
        WHERE o.user_id = (SELECT auth.uid())
          AND o.status = 'paid'
          AND oi.course_id = course_progress.course_id
          AND oi.access_status = 'active'
          AND oi.access_expires_at > NOW()
      )
    )
    OR (SELECT app_private.current_user_role() = 'admin')
  );
