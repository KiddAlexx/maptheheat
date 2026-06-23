-- Step 12: Account deletion
-- Re-key the three author FKs that reference profiles(user_id) to
-- ON DELETE SET NULL so that deleting an auth.users row (which cascades
-- to profiles) no longer raises a FK violation on surviving content rows.
-- venue_details and venue_reviews are already nullable; venue_images needs
-- its NOT NULL constraint dropped first.
-- Also adds delete_my_account() so authenticated users can self-delete.

-- 1. venue_details.user_id — drop and re-add FK with SET NULL
ALTER TABLE public.venue_details
  DROP CONSTRAINT venue_details_user_id_fkey;

ALTER TABLE public.venue_details
  ADD CONSTRAINT venue_details_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles (user_id)
    ON DELETE SET NULL;

-- 2. venue_reviews.user_id — drop and re-add FK with SET NULL
ALTER TABLE public.venue_reviews
  DROP CONSTRAINT venue_reviews_user_id_fkey;

ALTER TABLE public.venue_reviews
  ADD CONSTRAINT venue_reviews_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles (user_id)
    ON DELETE SET NULL;

-- 3. venue_images.user_id — make nullable, then re-add FK with SET NULL
ALTER TABLE public.venue_images
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.venue_images
  DROP CONSTRAINT venue_images_user_id_fkey;

ALTER TABLE public.venue_images
  ADD CONSTRAINT venue_images_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles (user_id)
    ON DELETE SET NULL;

-- 4. Self-deletion RPC.  Runs as postgres (SECURITY DEFINER) so it can
--    delete from auth.users, which the authenticated role cannot touch
--    directly.  Cascades to profiles; author FKs above are SET NULL.
--    Unauthenticated callers get a no-op (auth.uid() → null).
CREATE OR REPLACE FUNCTION public.delete_my_account()
  RETURNS void
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
AS $$
  DELETE FROM auth.users WHERE id = auth.uid();
$$;

ALTER FUNCTION public.delete_my_account() OWNER TO postgres;
