-- Make favourite_venues private. Revoke direct SELECT access and route all
-- reads/writes through SECURITY DEFINER RPCs so no caller can read the raw
-- array from a plain SELECT on profiles.

-- 1. Revoke column-level SELECT. Owner writes stay permitted by the existing
--    GRANT UPDATE(favourite_venues) column grant.
REVOKE SELECT (favourite_venues) ON public.profiles FROM anon, authenticated;

-- 2. Owner reads their own favourite venue IDs.
CREATE OR REPLACE FUNCTION public.get_my_favourites()
  RETURNS uuid[]
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT coalesce(favourite_venues, '{}')
  FROM   public.profiles
  WHERE  user_id = auth.uid()
$$;

ALTER FUNCTION public.get_my_favourites() OWNER TO postgres;

-- 3. Owner atomically toggles a venue in/out of their favourites.
CREATE OR REPLACE FUNCTION public.toggle_favourite(p_venue_id uuid)
  RETURNS uuid[]
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  current_favs uuid[];
  updated_favs  uuid[];
BEGIN
  SELECT coalesce(favourite_venues, '{}')
  INTO   current_favs
  FROM   public.profiles
  WHERE  user_id = auth.uid();

  IF p_venue_id = ANY(current_favs) THEN
    updated_favs := array_remove(current_favs, p_venue_id);
  ELSE
    updated_favs := array_append(current_favs, p_venue_id);
  END IF;

  UPDATE public.profiles
  SET    favourite_venues = updated_favs
  WHERE  user_id = auth.uid();

  RETURN updated_favs;
END;
$$;

ALTER FUNCTION public.toggle_favourite(uuid) OWNER TO postgres;

-- 4. Public favourites: approved venue IDs for a user who has opted in.
--    Returns empty array when is_public is false, show_favourites is false,
--    or the user doesn't exist — never exposes the raw favourite_venues array.
CREATE OR REPLACE FUNCTION public.get_public_favourites(p_user_id uuid)
  RETURNS uuid[]
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT coalesce(
    (
      SELECT array_agg(vd.venue_id)
      FROM   public.profiles p
      JOIN   public.venue_details vd
        ON   vd.venue_id = ANY(p.favourite_venues)
       AND   vd.status   = 'approved'
      WHERE  p.user_id        = p_user_id
        AND  p.is_public       = true
        AND  p.show_favourites = true
    ),
    '{}'::uuid[]
  )
$$;

ALTER FUNCTION public.get_public_favourites(uuid) OWNER TO postgres;
