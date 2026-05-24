DROP POLICY IF EXISTS "Users can view own progress" ON public.course_progress;
DROP POLICY IF EXISTS "Users can insert own progress with active access" ON public.course_progress;
DROP POLICY IF EXISTS "Users can update own progress with active access" ON public.course_progress;
DROP POLICY IF EXISTS "Users can delete own progress with active access" ON public.course_progress;

CREATE POLICY "Users can view own progress" ON public.course_progress
  FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id
    OR (SELECT app_private.current_user_role() = 'admin')
  );

CREATE POLICY "Users can insert own progress with active access" ON public.course_progress
  FOR INSERT
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
          AND oi.access_expires_at > NOW()
      )
    )
    OR (SELECT app_private.current_user_role() = 'admin')
  );

CREATE POLICY "Users can update own progress with active access" ON public.course_progress
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
          AND oi.access_expires_at > NOW()
      )
    )
    OR (SELECT app_private.current_user_role() = 'admin')
  );

CREATE POLICY "Users can delete own progress with active access" ON public.course_progress
  FOR DELETE
  USING (
    (
      (SELECT auth.uid()) = user_id
      AND EXISTS (
        SELECT 1
        FROM public.orders AS o
        JOIN public.order_items AS oi ON oi.order_id = o.id
        WHERE o.user_id = (SELECT auth.uid())
          AND o.status = 'paid'
          AND oi.course_id = course_progress.course_id
          AND oi.access_expires_at > NOW()
      )
    )
    OR (SELECT app_private.current_user_role() = 'admin')
  );
