-- Harden Step 12 account deletion after the initial staging migration.
-- Account deletion is coordinated by the delete-account Edge Function so
-- storage cleanup completes before the auth.users row is removed.

-- Deleting a profile sets review.user_id to NULL. That foreign-key action is
-- an UPDATE, so the owner guard must not send an approved review back to the
-- pending moderation queue when it runs inside a postgres-owned function.
CREATE OR REPLACE FUNCTION public.review_owner_update_guard()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF current_user <> 'postgres' AND NOT public.is_admin() THEN
    NEW.status := 'pending';
    NEW.venue_id := OLD.venue_id;
  END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.review_owner_update_guard() OWNER TO postgres;

-- Public venue metrics must describe the same approved review set that the
-- public review list displays. Recalculate both old and new venues when an
-- admin moves a review between venues.
CREATE OR REPLACE FUNCTION public.calculate_venue_metrics()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  affected_venue_id uuid;
  affected_venue_ids uuid[];
BEGIN
  IF TG_OP = 'INSERT' THEN
    affected_venue_ids := ARRAY[NEW.venue_id];
  ELSIF TG_OP = 'DELETE' THEN
    affected_venue_ids := ARRAY[OLD.venue_id];
  ELSE
    affected_venue_ids := ARRAY[OLD.venue_id, NEW.venue_id];
  END IF;

  FOREACH affected_venue_id IN ARRAY affected_venue_ids LOOP
    IF affected_venue_id IS NULL THEN
      CONTINUE;
    END IF;

    UPDATE public.venue_details AS venue
    SET
      total_reviews = (
        SELECT count(*)::smallint
        FROM public.venue_reviews AS review
        WHERE review.venue_id = affected_venue_id
          AND review.status = 'approved'
      ),
      average_heat_rating = (
        SELECT coalesce(avg(review.heat_rating), 0)
        FROM public.venue_reviews AS review
        WHERE review.venue_id = affected_venue_id
          AND review.status = 'approved'
      ),
      average_quality_rating = (
        SELECT coalesce(avg(review.quality_rating), 0)
        FROM public.venue_reviews AS review
        WHERE review.venue_id = affected_venue_id
          AND review.status = 'approved'
      ),
      hottest_dishes = (
        SELECT array_agg(ranked.hottest_dish)
        FROM (
          SELECT review.hottest_dish
          FROM public.venue_reviews AS review
          WHERE review.venue_id = affected_venue_id
            AND review.status = 'approved'
            AND review.review_type = 'restaurant'
            AND review.hottest_dish IS NOT NULL
          GROUP BY review.hottest_dish
          ORDER BY count(*) DESC, review.hottest_dish
          LIMIT 3
        ) AS ranked
      ),
      hottest_sauces = (
        SELECT array_agg(ranked.hottest_sauce)
        FROM (
          SELECT review.hottest_sauce
          FROM public.venue_reviews AS review
          WHERE review.venue_id = affected_venue_id
            AND review.status = 'approved'
            AND review.review_type = 'shop'
            AND review.hottest_sauce IS NOT NULL
          GROUP BY review.hottest_sauce
          ORDER BY count(*) DESC, review.hottest_sauce
          LIMIT 3
        ) AS ranked
      )
    WHERE venue.venue_id = affected_venue_id;
  END LOOP;

  RETURN NULL;
END;
$$;

ALTER FUNCTION public.calculate_venue_metrics() OWNER TO postgres;

-- The first staging deletion happened before the trigger guard above was
-- fixed. The deleted user's retained reviews were known to be approved, so
-- restore any ownerless review and let the metric trigger recalculate it.
UPDATE public.venue_reviews
SET status = 'approved'
WHERE user_id IS NULL
  AND status IS DISTINCT FROM 'approved';

-- Rebuild every venue's denormalised metrics from approved reviews only. This
-- also repairs totals that previously counted pending or declined reviews.
WITH recalculated_metrics AS (
  SELECT venue.venue_id, metrics.*
  FROM public.venue_details AS venue
  CROSS JOIN LATERAL (
  SELECT
    count(*)::smallint AS total_reviews,
    coalesce(avg(review.heat_rating), 0) AS average_heat_rating,
    coalesce(avg(review.quality_rating), 0) AS average_quality_rating,
    (
      SELECT array_agg(ranked.hottest_dish)
      FROM (
        SELECT restaurant_review.hottest_dish
        FROM public.venue_reviews AS restaurant_review
        WHERE restaurant_review.venue_id = venue.venue_id
          AND restaurant_review.status = 'approved'
          AND restaurant_review.review_type = 'restaurant'
          AND restaurant_review.hottest_dish IS NOT NULL
        GROUP BY restaurant_review.hottest_dish
        ORDER BY count(*) DESC, restaurant_review.hottest_dish
        LIMIT 3
      ) AS ranked
    ) AS hottest_dishes,
    (
      SELECT array_agg(ranked.hottest_sauce)
      FROM (
        SELECT shop_review.hottest_sauce
        FROM public.venue_reviews AS shop_review
        WHERE shop_review.venue_id = venue.venue_id
          AND shop_review.status = 'approved'
          AND shop_review.review_type = 'shop'
          AND shop_review.hottest_sauce IS NOT NULL
        GROUP BY shop_review.hottest_sauce
        ORDER BY count(*) DESC, shop_review.hottest_sauce
        LIMIT 3
      ) AS ranked
    ) AS hottest_sauces
    FROM public.venue_reviews AS review
    WHERE review.venue_id = venue.venue_id
      AND review.status = 'approved'
  ) AS metrics
)
UPDATE public.venue_details AS venue
SET
  total_reviews = metrics.total_reviews,
  average_heat_rating = metrics.average_heat_rating,
  average_quality_rating = metrics.average_quality_rating,
  hottest_dishes = metrics.hottest_dishes,
  hottest_sauces = metrics.hottest_sauces
FROM recalculated_metrics AS metrics
WHERE metrics.venue_id = venue.venue_id;

-- Review image metadata follows the review. Storage objects are removed first
-- by the Edge Function using the manifest returned below.
ALTER TABLE public.venue_images
  DROP CONSTRAINT venue_images_review_id_fkey;

ALTER TABLE public.venue_images
  ADD CONSTRAINT venue_images_review_id_fkey
    FOREIGN KEY (review_id)
    REFERENCES public.venue_reviews (review_id)
    ON DELETE CASCADE;

-- The browser-callable SECURITY DEFINER function from the first migration is
-- replaced by service-role-only preparation/finalisation functions.
DROP FUNCTION IF EXISTS public.delete_my_account();

CREATE OR REPLACE FUNCTION public.prepare_account_deletion(
  p_user_id uuid,
  p_delete_reviews boolean
)
  RETURNS TABLE (bucket_id text, object_name text)
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  CREATE TEMP TABLE account_deletion_venues (
    venue_id uuid PRIMARY KEY
  ) ON COMMIT DROP;

  INSERT INTO account_deletion_venues (venue_id)
  SELECT venue.venue_id
  FROM public.venue_details AS venue
  WHERE venue.user_id = p_user_id
    AND venue.status IS DISTINCT FROM 'approved';

  CREATE TEMP TABLE account_deletion_images (
    image_id uuid PRIMARY KEY,
    venue_id uuid NOT NULL,
    image_path json
  ) ON COMMIT DROP;

  INSERT INTO account_deletion_images (image_id, venue_id, image_path)
  SELECT image.image_id, image.venue_id, image.image_path
  FROM public.venue_images AS image
  JOIN public.venue_details AS venue
    ON venue.venue_id = image.venue_id
  LEFT JOIN public.venue_reviews AS review
    ON review.review_id = image.review_id
  WHERE image.venue_id IN (SELECT deleted_venue.venue_id FROM account_deletion_venues AS deleted_venue)
     OR (
       image.user_id = p_user_id
       AND NOT (
         image.status = 'approved'
         AND venue.status = 'approved'
         AND (
           image.image_type IN ('venue', 'standalone')
           OR (
             image.image_type = 'review'
             AND review.status = 'approved'
             AND (NOT p_delete_reviews OR review.user_id IS DISTINCT FROM p_user_id)
           )
         )
       )
     )
     OR (
       review.user_id = p_user_id
       AND (p_delete_reviews OR review.status IS DISTINCT FROM 'approved')
     );

  CREATE TEMP TABLE account_deletion_retained_objects (
    bucket_id text NOT NULL,
    object_name text NOT NULL,
    PRIMARY KEY (bucket_id, object_name)
  ) ON COMMIT DROP;

  INSERT INTO account_deletion_retained_objects (bucket_id, object_name)
  SELECT DISTINCT 'venue-images', path.value
  FROM public.venue_images AS image
  JOIN public.venue_details AS venue
    ON venue.venue_id = image.venue_id
  LEFT JOIN public.venue_reviews AS review
    ON review.review_id = image.review_id
  CROSS JOIN LATERAL json_each_text(image.image_path) AS path
  WHERE image.user_id = p_user_id
    AND image.status = 'approved'
    AND venue.status = 'approved'
    AND path.value <> ''
    AND (
      image.image_type IN ('venue', 'standalone')
      OR (
        image.image_type = 'review'
        AND review.status = 'approved'
        AND (NOT p_delete_reviews OR review.user_id IS DISTINCT FROM p_user_id)
      )
    );

  CREATE TEMP TABLE account_deletion_disposable_objects (
    bucket_id text NOT NULL,
    object_name text NOT NULL,
    PRIMARY KEY (bucket_id, object_name)
  ) ON COMMIT DROP;

  INSERT INTO account_deletion_disposable_objects (bucket_id, object_name)
  SELECT DISTINCT 'venue-images', path.value
  FROM account_deletion_images AS image
  CROSS JOIN LATERAL json_each_text(image.image_path) AS path
  WHERE path.value <> '';

  INSERT INTO account_deletion_disposable_objects (bucket_id, object_name)
  SELECT object.bucket_id, object.name
  FROM storage.objects AS object
  WHERE (object.owner = p_user_id OR object.owner_id = p_user_id::text)
    AND NOT EXISTS (
      SELECT 1
      FROM account_deletion_retained_objects AS retained
      WHERE retained.bucket_id = object.bucket_id
        AND retained.object_name = object.name
    )
  ON CONFLICT DO NOTHING;

  RETURN QUERY
  SELECT disposable.bucket_id, disposable.object_name
  FROM account_deletion_disposable_objects AS disposable
  ORDER BY disposable.bucket_id, disposable.object_name;
END;
$$;

ALTER FUNCTION public.prepare_account_deletion(uuid, boolean) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.prepare_account_deletion(uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prepare_account_deletion(uuid, boolean) TO service_role;

CREATE OR REPLACE FUNCTION public.finalize_account_deletion(
  p_user_id uuid,
  p_delete_reviews boolean,
  p_storage_base_url text
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  affected_venue_id uuid;
  replacement_thumbnail jsonb;
BEGIN
  IF nullif(trim(p_storage_base_url), '') IS NULL THEN
    RAISE EXCEPTION 'Storage base URL is required';
  END IF;

  -- Retained community content must no longer be owned by the deleted Auth
  -- user, otherwise Supabase Auth refuses to remove that user. Doing this in
  -- the final transaction preserves ownership if external cleanup fails.
  UPDATE storage.objects AS object
  SET owner = NULL,
      owner_id = NULL
  WHERE (object.owner = p_user_id OR object.owner_id = p_user_id::text)
    AND object.bucket_id = 'venue-images'
    AND EXISTS (
      SELECT 1
      FROM public.venue_images AS image
      JOIN public.venue_details AS venue
        ON venue.venue_id = image.venue_id
      LEFT JOIN public.venue_reviews AS review
        ON review.review_id = image.review_id
      CROSS JOIN LATERAL json_each_text(image.image_path) AS path
      WHERE image.user_id = p_user_id
        AND image.status = 'approved'
        AND venue.status = 'approved'
        AND path.value = object.name
        AND (
          image.image_type IN ('venue', 'standalone')
          OR (
            image.image_type = 'review'
            AND review.status = 'approved'
            AND (NOT p_delete_reviews OR review.user_id IS DISTINCT FROM p_user_id)
          )
        )
    );

  IF EXISTS (
    SELECT 1
    FROM storage.objects AS object
    WHERE object.owner = p_user_id
       OR object.owner_id = p_user_id::text
  ) THEN
    RAISE EXCEPTION 'User still owns storage objects';
  END IF;

  CREATE TEMP TABLE account_deletion_venues (
    venue_id uuid PRIMARY KEY
  ) ON COMMIT DROP;

  INSERT INTO account_deletion_venues (venue_id)
  SELECT venue.venue_id
  FROM public.venue_details AS venue
  WHERE venue.user_id = p_user_id
    AND venue.status IS DISTINCT FROM 'approved';

  CREATE TEMP TABLE account_deletion_images (
    image_id uuid PRIMARY KEY,
    venue_id uuid NOT NULL,
    small_path text
  ) ON COMMIT DROP;

  INSERT INTO account_deletion_images (image_id, venue_id, small_path)
  SELECT image.image_id, image.venue_id, image.image_path ->> 'sm'
  FROM public.venue_images AS image
  JOIN public.venue_details AS venue
    ON venue.venue_id = image.venue_id
  LEFT JOIN public.venue_reviews AS review
    ON review.review_id = image.review_id
  WHERE image.venue_id IN (SELECT deleted_venue.venue_id FROM account_deletion_venues AS deleted_venue)
     OR (
       image.user_id = p_user_id
       AND NOT (
         image.status = 'approved'
         AND venue.status = 'approved'
         AND (
           image.image_type IN ('venue', 'standalone')
           OR (
             image.image_type = 'review'
             AND review.status = 'approved'
             AND (NOT p_delete_reviews OR review.user_id IS DISTINCT FROM p_user_id)
           )
         )
       )
     )
     OR (
       review.user_id = p_user_id
       AND (p_delete_reviews OR review.status IS DISTINCT FROM 'approved')
     );

  -- A deleted image may currently be the venue card thumbnail. Promote the
  -- oldest remaining approved image, or clear the thumbnail when none remain.
  FOR affected_venue_id IN
    SELECT DISTINCT venue.venue_id
    FROM public.venue_details AS venue
    JOIN account_deletion_images AS deleted_image
      ON deleted_image.venue_id = venue.venue_id
    WHERE deleted_image.small_path IS NOT NULL
      AND right(
        coalesce(venue.thumbnail_image ->> 'url', ''),
        length(deleted_image.small_path)
      ) = deleted_image.small_path
  LOOP
    SELECT jsonb_build_object(
      'url', rtrim(p_storage_base_url, '/') ||
        '/storage/v1/object/public/venue-images/' ||
        (image.image_path ->> 'sm'),
      'alt', coalesce(image.alt_text, '')
    )
    INTO replacement_thumbnail
    FROM public.venue_images AS image
    WHERE image.venue_id = affected_venue_id
      AND image.status = 'approved'
      AND image.image_path ->> 'sm' IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM account_deletion_images AS deleted_image
        WHERE deleted_image.image_id = image.image_id
      )
    ORDER BY image.created_at, image.image_id
    LIMIT 1;

    UPDATE public.venue_details
    SET thumbnail_image = replacement_thumbnail
    WHERE venue_id = affected_venue_id;
  END LOOP;

  DELETE FROM public.venue_images AS image
  WHERE image.image_id IN (
    SELECT deleted_image.image_id
    FROM account_deletion_images AS deleted_image
  );

  DELETE FROM public.venue_reviews AS review
  WHERE (
      review.user_id = p_user_id
      AND (p_delete_reviews OR review.status IS DISTINCT FROM 'approved')
    )
    OR review.venue_id IN (
      SELECT deleted_venue.venue_id
      FROM account_deletion_venues AS deleted_venue
    );

  DELETE FROM public.venue_details AS venue
  WHERE venue.venue_id IN (
    SELECT deleted_venue.venue_id
    FROM account_deletion_venues AS deleted_venue
  );

  DELETE FROM public.user_notifications AS notification
  WHERE notification.user_id = p_user_id;

  DELETE FROM auth.users AS auth_user
  WHERE auth_user.id = p_user_id;
END;
$$;

ALTER FUNCTION public.finalize_account_deletion(uuid, boolean, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.finalize_account_deletion(uuid, boolean, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_account_deletion(uuid, boolean, text) TO service_role;
