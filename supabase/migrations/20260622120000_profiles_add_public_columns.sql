-- Add is_public, show_favourites, and created_at to profiles.
-- created_at is backfilled from auth.users — not defaulted to now() — so
-- existing users retain their real join date instead of the migration date.

ALTER TABLE public.profiles
  ADD COLUMN is_public       boolean     NOT NULL DEFAULT true,
  ADD COLUMN show_favourites boolean     NOT NULL DEFAULT false,
  ADD COLUMN created_at      timestamptz;

-- Backfill created_at for all existing rows from auth.users.
UPDATE public.profiles p
SET    created_at = u.created_at
FROM   auth.users u
WHERE  p.user_id = u.id;

-- Populate created_at for future signups.
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
AS $$
begin
  if tg_op is null then
    raise exception 'This function can only be run as a trigger';
  end if;

  insert into public.profiles (user_id, avatar_url, created_at)
  values (new.id, new.raw_user_meta_data->>'avatar_url', new.created_at)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
