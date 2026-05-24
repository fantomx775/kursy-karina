ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS instagram_username TEXT;

UPDATE public.users
SET instagram_username = NULLIF(BTRIM(instagram_username), '')
WHERE instagram_username IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_instagram_username_not_blank'
      AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_instagram_username_not_blank
      CHECK (instagram_username IS NULL OR BTRIM(instagram_username) <> '');
  END IF;
END $$;

COMMENT ON COLUMN public.users.instagram_username IS
  'Instagram username provided during registration for course contact and group invites.';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_name TEXT;
  first_name_part TEXT;
  last_name_part TEXT;
  instagram_username_value TEXT;
BEGIN
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  instagram_username_value :=
    NULLIF(BTRIM(NEW.raw_user_meta_data->>'instagram_username'), '');

  IF user_name IS NULL OR user_name = '' THEN
    first_name_part := split_part(NEW.email, '@', 1);
    last_name_part := 'User';
  ELSE
    first_name_part := split_part(user_name, ' ', 1);
    last_name_part := COALESCE(NULLIF(substring(user_name from position(' ' in user_name) + 1), ''), 'User');

    IF first_name_part = user_name THEN
      last_name_part := 'User';
    END IF;
  END IF;

  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    instagram_username,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(first_name_part, ''), 'User'),
    COALESCE(NULLIF(last_name_part, ''), 'User'),
    instagram_username_value,
    'student'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user()
  FROM PUBLIC, anon, authenticated;
