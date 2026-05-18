


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."review_type" AS ENUM (
    'restaurant',
    'shop'
);


ALTER TYPE "public"."review_type" OWNER TO "postgres";


CREATE TYPE "public"."venue_type" AS ENUM (
    'restaurant',
    'shop'
);


ALTER TYPE "public"."venue_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_delete_notification"("p_notification_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  if not is_admin() then
    raise exception 'forbidden';
  end if;

  delete from public.user_notifications
  where notification_id = p_notification_id;

  if not found then
    raise exception 'notification_id % not found', p_notification_id;
  end if;
end;
$$;


ALTER FUNCTION "public"."admin_delete_notification"("p_notification_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."user_notifications" (
    "notification_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "venue_id" "uuid",
    "related_type" "text",
    "notification_status" "text",
    "title" "text",
    "message" "text",
    "link_url" "text",
    "user_id" "uuid",
    "request_status" "text"
);


ALTER TABLE "public"."user_notifications" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_insert_notification"("p" "jsonb") RETURNS "public"."user_notifications"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $_$
declare
  out_row public.user_notifications;
  v_user_id uuid;
  v_venue_id uuid;
begin
  if not is_admin() then
    raise exception 'forbidden';
  end if;

  -- validate/parse user_id (required)
  if p ? 'user_id' and nullif(p->>'user_id','') is not null
     and (p->>'user_id') ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  then
    v_user_id := (p->>'user_id')::uuid;
  else
    raise exception 'user_id (uuid) is required';
  end if;

  -- validate/parse venue_id (optional)
  if p ? 'venue_id' and nullif(p->>'venue_id','') is not null
     and (p->>'venue_id') ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  then
    v_venue_id := (p->>'venue_id')::uuid;
  else
    v_venue_id := null;
  end if;

  insert into public.user_notifications (
    user_id, venue_id, related_type, notification_status, title, message, link_url, request_status
  )
  values (
    v_user_id,
    v_venue_id,
    p->>'related_type',
    coalesce(p->>'notification_status', 'unread'),
    p->>'title',
    p->>'message',
    nullif(p->>'link_url',''),
    nullif(p->>'request_status','')
  )
  returning * into out_row;

  return out_row;
end;
$_$;


ALTER FUNCTION "public"."admin_insert_notification"("p" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_update_notification"("p_notification_id" "uuid", "patch" "jsonb") RETURNS "public"."user_notifications"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $_$
declare
  out_row public.user_notifications;
begin
  if not is_admin() then
    raise exception 'forbidden';
  end if;

  update public.user_notifications un
  set
    -- only update if the key exists in patch; otherwise keep existing
    user_id = case
      when patch ? 'user_id' and nullif(patch->>'user_id','') is not null
           and (patch->>'user_id') ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
        then (patch->>'user_id')::uuid
      when patch ? 'user_id' and (patch->>'user_id') is null
        then null
      else un.user_id
    end,

    venue_id = case
      when patch ? 'venue_id' and nullif(patch->>'venue_id','') is not null
           and (patch->>'venue_id') ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
        then (patch->>'venue_id')::uuid
      when patch ? 'venue_id' and (patch->>'venue_id') is null
        then null
      else un.venue_id
    end,

    related_type = case
      when patch ? 'related_type' then patch->>'related_type'
      else un.related_type
    end,

    notification_status = case
      when patch ? 'notification_status' then patch->>'notification_status'
      else un.notification_status
    end,

    title = case
      when patch ? 'title' then patch->>'title'
      else un.title
    end,

    message = case
      when patch ? 'message' then patch->>'message'
      else un.message
    end,

    link_url = case
      when patch ? 'link_url' then nullif(patch->>'link_url','')
      else un.link_url
    end,

    request_status = case
      when patch ? 'request_status' then nullif(patch->>'request_status','')
      else un.request_status
    end

  where un.notification_id = p_notification_id
  returning * into out_row;

  if not found then
    raise exception 'notification_id % not found', p_notification_id;
  end if;

  return out_row;
end;
$_$;


ALTER FUNCTION "public"."admin_update_notification"("p_notification_id" "uuid", "patch" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_venue_metrics"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
    review_count INT;
    avg_heat_rating DECIMAL;
    avg_quality_rating DECIMAL;
begin
    -- Calculate totals/averages
    select
        count(*),
        coalesce(avg(heat_rating), 0),
        coalesce(avg(quality_rating), 0)
    into
        review_count,
        avg_heat_rating,
        avg_quality_rating
    from public.venue_reviews
    where venue_id = coalesce(new.venue_id, old.venue_id);

    -- Update the venue details
    update public.venue_details
    set
        total_reviews       = review_count,
        average_heat_rating = avg_heat_rating,
        average_quality_rating = avg_quality_rating
    where venue_id = coalesce(new.venue_id, old.venue_id);

    -- Hottest dish or sauce logic (unchanged)
    if coalesce(new.review_type, old.review_type) = 'restaurant' then
        update public.venue_details
        set hottest_dishes = (
            select array_agg(hottest_dish)
            from (
                select hottest_dish
                from public.venue_reviews
                where venue_id = coalesce(new.venue_id, old.venue_id)
                  and review_type = 'restaurant'
                group by hottest_dish
                order by count(*) desc, hottest_dish
                limit 3
            ) s
        )
        where venue_id = coalesce(new.venue_id, old.venue_id);
    elsif coalesce(new.review_type, old.review_type) = 'shop' then
        update public.venue_details
        set hottest_sauces = (
            select array_agg(hottest_sauce)
            from (
                select hottest_sauce
                from public.venue_reviews
                where venue_id = coalesce(new.venue_id, old.venue_id)
                  and review_type = 'shop'
                group by hottest_sauce
                order by count(*) desc, hottest_sauce
                limit 3
            ) s
        )
        where venue_id = coalesce(new.venue_id, old.venue_id);
    end if;

    return null;
end;
$$;


ALTER FUNCTION "public"."calculate_venue_metrics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_submit_review"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select (
    select count(*)::int
    from public.venue_reviews
    where user_id = auth.uid()
      and status = 'pending'
  ) < 2
$$;


ALTER FUNCTION "public"."can_submit_review"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_submit_review_for_venue"("p_venue_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select not exists (
    select 1
    from public.venue_reviews r
    where r.user_id  = auth.uid()
      and r.venue_id = p_venue_id
      and r.created_at > now() - interval '30 days'
      and r.status in ('pending','approved')
  )
$$;


ALTER FUNCTION "public"."can_submit_review_for_venue"("p_venue_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_submit_standalone_images"("batch_size" integer DEFAULT 1) RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select (
    (
      select count(*)::int
      from public.venue_images
      where user_id = auth.uid()
        and image_type = 'standalone'
        and status = 'pending'
    ) + greatest(coalesce(batch_size, 1), 1)
  ) <= 6
$$;


ALTER FUNCTION "public"."can_submit_standalone_images"("batch_size" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_submit_venue"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select (
    select count(*)::int
    from public.venue_details
    where user_id = auth.uid()
      and coalesce(status, 'pending') = 'pending'
  ) < 2
$$;


ALTER FUNCTION "public"."can_submit_venue"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_welcome_notification"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  -- Extra safety: ensure it's only callable as a trigger
  if tg_op is null then
    raise exception 'This function can only be run as a trigger';
  end if;

  insert into public.user_notifications (
    -- notification_id: auto (default)
    -- created_at:      auto (default)
    related_type,
    title,
    message,
    link_url,
    venue_id,
    user_id,
    notification_status,
    request_status
  )
  values (
    'none',                               -- related_type
    'Welcome to Map The Heat',            -- title
    'Thanks so much for signing up!',     -- message
    null,                                 -- link_url
    null,                                 -- venue_id
    new.id,                               -- user_id (from auth.users)
    'unread',                             -- notification_status
    null                                  -- request_status
  );

  return new;
end;
$$;


ALTER FUNCTION "public"."create_welcome_notification"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_pending_reviews_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  _cnt int;
begin
  if coalesce(new.status, 'pending') = 'pending' then
    select count(*) into _cnt
    from public.venue_reviews
    where user_id = new.user_id
      and status = 'pending';

    if _cnt >= 2 then
      raise exception 'Limit reached: you can have at most 2 reviews awaiting approval.' using errcode = '45000';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_pending_reviews_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_pending_standalone_images_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  r record;
  max_limit int := 6;
  total_after int;
  batch_count int;
  existing_pending_before int;
  remaining int;
begin
  -- For each user present in THIS statement’s new rows (standalone + pending-like)
  for r in
    select user_id
    from new_images
    where image_type = 'standalone'
      and coalesce(status, 'pending') in ('pending','submitted')
      and user_id is not null
    group by user_id
  loop
    -- how many rows in THIS batch for this user
    select count(*) into batch_count
    from new_images
    where image_type = 'standalone'
      and coalesce(status, 'pending') in ('pending','submitted')
      and user_id = r.user_id;

    -- AFTER-insert count (includes rows just inserted)
    select count(*) into total_after
    from public.venue_images
    where user_id = r.user_id
      and image_type = 'standalone'
      and coalesce(status, 'pending') in ('pending','submitted');

    -- derive "before" and remaining slots
    existing_pending_before := greatest(total_after - batch_count, 0);
    remaining := greatest(max_limit - existing_pending_before, 0);

    if total_after > max_limit then
      raise exception
        'Upload limit reached: you already have % pending standalone images. You can add at most % more right now (max %). You tried to add %.',
        existing_pending_before, remaining, max_limit, batch_count
        using errcode = '45000';
    end if;
  end loop;

  return null;  -- statement-level trigger
end;
$$;


ALTER FUNCTION "public"."enforce_pending_standalone_images_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_pending_venues_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  _cnt int;
begin
  -- only enforce when the new row is (effectively) pending
  if coalesce(new.status, 'pending') = 'pending' then
    select count(*) into _cnt
    from public.venue_details
    where user_id = new.user_id
      and coalesce(status, 'pending') = 'pending';

    if _cnt >= 2 then
      raise exception 'Limit reached: you can have at most 2 venues awaiting approval.' using errcode = '45000';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_pending_venues_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_review_cooldown"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  _exists boolean;
begin
  -- Only enforce when the incoming review is effectively pending/approved-like
  if coalesce(new.status, 'pending') in ('pending','approved') then
    select exists (
      select 1
      from public.venue_reviews r
      where r.user_id   = new.user_id
        and r.venue_id  = new.venue_id
        and r.created_at > now() - interval '30 days'
        and r.status in ('pending','approved')
    )
    into _exists;

    if _exists then
      raise exception 'You can only submit one review for this venue every 30 days.' using errcode = '45000';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_review_cooldown"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_pending_cities"() RETURNS TABLE("city" "text", "country" "text")
    LANGUAGE "sql" STABLE
    AS $$
  select distinct vd.city, vd.country
  from public.venue_details vd
  where vd.status = 'pending'
    and vd.city is not null
    and vd.country is not null
  order by vd.city, vd.country;
$$;


ALTER FUNCTION "public"."get_pending_cities"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_unique_cities"("venue_ids" "uuid"[]) RETURNS TABLE("city" "text", "country" "text")
    LANGUAGE "plpgsql"
    AS $$BEGIN
  RETURN QUERY
  SELECT DISTINCT venue_details.city, venue_details.country
  FROM venue_details
  WHERE venue_details.venue_id = ANY(venue_ids)
  ORDER BY venue_details.city, venue_details.country;
END;$$;


ALTER FUNCTION "public"."get_unique_cities"("venue_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  -- only valid as a trigger
  if tg_op is null then
    raise exception 'This function can only be run as a trigger';
  end if;

  insert into public.profiles (user_id, avatar_url)
  values (new.id, new.raw_user_meta_data->>'avatar_url')
  on conflict (user_id) do nothing;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  )
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_review_submission"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  v_city  text;
  v_slug  text;
  v_name  text;
  _link   text;
begin
  select vd.city, vd.venue_name_slug, vd.venue_name
    into v_city, v_slug, v_name
  from public.venue_details vd
  where vd.venue_id = new.venue_id;

  _link := concat(
    '/app/venue/',
    coalesce(v_city, ''),
    '/',
    coalesce(v_slug, ''),
    '/',
    new.venue_id
  );

  insert into public.user_notifications
    (user_id, venue_id, related_type, notification_status, title, message, link_url, request_status)
  values
    (
      new.user_id,
      new.venue_id,
      'review',
      'unread',
      'Review submitted for approval',
      format('Thanks for reviewing %s. We will let you know ASAP when it has been approved.', coalesce(v_name, 'this venue')),
      _link,
      'pending'
    );

  return new;
end;
$$;


ALTER FUNCTION "public"."notify_review_submission"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_standalone_images"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  -- Runs after INSERT ... (statement-level) with REFERENCING NEW TABLE AS new_images
  insert into public.user_notifications
    (user_id, venue_id, related_type, notification_status, title, message, link_url, request_status)
  select
    ni.user_id,
    ni.venue_id,
    'image' as related_type,
    'unread' as notification_status,
    'Images submitted for approval' as title,
    format(
      'Thanks for adding images to %s. We will let you know ASAP when they have been approved.',
      coalesce(vd.venue_name, 'this venue')
    ) as message,
    concat('/app/venue/', coalesce(vd.city,''), '/', coalesce(vd.venue_name_slug,''), '/', ni.venue_id) as link_url,
    'pending' as request_status
  from (
    select distinct user_id, venue_id
    from new_images                           -- transition table provided by the trigger
    where image_type = 'standalone'
      and coalesce(status, 'pending') in ('pending', 'submitted')
      and user_id is not null
      and venue_id is not null
  ) as ni
  join public.venue_details vd
    on vd.venue_id = ni.venue_id
  where not exists (
    select 1
    from public.user_notifications un
    where un.user_id        = ni.user_id
      and un.venue_id       = ni.venue_id
      and un.related_type   = 'image'
      and un.request_status = 'pending'
  );

  return null; -- statement-level triggers return null
end;
$$;


ALTER FUNCTION "public"."notify_standalone_images"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_venue_submission"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  _link text;
begin
  _link := concat(
    '/app/venue/',
    coalesce(new.city, ''),
    '/',
    coalesce(new.venue_name_slug, ''),
    '/',
    new.venue_id
  );

  insert into public.user_notifications
    (user_id, venue_id, related_type, notification_status, title, message, link_url, request_status)
  values
    (
      new.user_id,
      new.venue_id,
      'venue',
      'unread',
      'Venue submitted for approval',
      format('Thanks so much for adding %s. We will let you know ASAP when it has been approved.', new.venue_name),
      _link,
      'pending'
    );

  return new;
end;
$$;


ALTER FUNCTION "public"."notify_venue_submission"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."review_owner_update_guard"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$begin
  -- If not admin, enforce: reset status to pending and prevent venue_id change
  if not is_admin() then
    new.status := 'pending';
    new.venue_id := old.venue_id;
  end if;
  return new;
end;$$;


ALTER FUNCTION "public"."review_owner_update_guard"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_review_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  uid uuid := coalesce(new.user_id, old.user_id);
begin
  if tg_op is null then
    raise exception 'This function can only be run as a trigger';
  end if;

  update public.profiles p
     set total_reviews = (
       select count(*) from public.venue_reviews vr
       where vr.user_id = uid
         and vr.status = 'approved'   -- ← ADD THIS
     )
   where p.user_id = uid;

  return coalesce(new, old);
end;
$$;


ALTER FUNCTION "public"."update_user_review_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_venues_added"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  uid uuid := coalesce(new.user_id, old.user_id);
begin
  if tg_op is null then
    raise exception 'This function can only be run as a trigger';
  end if;

  update public.profiles p
     set total_venues_added = (
       select count(*) from public.venue_details vd
       where vd.user_id = uid
         and vd.status = 'approved'   -- ← ADD THIS
     )
   where p.user_id = uid;

  return coalesce(new, old);
end;
$$;


ALTER FUNCTION "public"."update_user_venues_added"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_unique_city"("p_city" "text", "p_country" "text", "p_coords" "jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  uid uuid := auth.uid();
  city_clean    text;
  country_clean text;
  lat double precision;
  lon double precision;
  out_id public.unique_cities.city_id%TYPE;
begin
  if uid is null then
    raise exception 'authentication required';
  end if;

  -- normalize inputs
  city_clean    := regexp_replace(trim(p_city), '\s+', ' ', 'g');
  country_clean := regexp_replace(trim(p_country), '\s+', ' ', 'g');

  -- parse coords (accept "lon" or "lng" from callers; we STORE "lon")
  lat := nullif(p_coords->>'lat','')::double precision;
  lon := coalesce(
          nullif(p_coords->>'lon','')::double precision,
          nullif(p_coords->>'lng','')::double precision
        );

  -- validation
  if city_clean is null or city_clean = '' then raise exception 'city required'; end if;
  if country_clean is null or country_clean = '' then raise exception 'country required'; end if;
  if lat is null or lon is null or lat < -90 or lat > 90 or lon < -180 or lon > 180 then
    raise exception 'invalid coordinates';
  end if;

  -- insert if missing; de-duped by city_key unique index
  insert into public.unique_cities (city, country, coords)
  values (city_clean, country_clean, jsonb_build_object('lat', lat, 'lon', lon))
  on conflict (city_key) do nothing;

  -- return city_id (works for new or existing)
  select uc.city_id into out_id
  from public.unique_cities uc
  where uc.city_key = lower(regexp_replace(trim(p_city), '\s+', ' ', 'g')) || '|' ||
                       lower(regexp_replace(trim(p_country), '\s+', ' ', 'g'))
  limit 1;

  return out_id;
end;
$$;


ALTER FUNCTION "public"."upsert_unique_city"("p_city" "text", "p_country" "text", "p_coords" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."vd_before_insert_guard"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  if not is_admin() then
    new.user_id := auth.uid();
    new.status  := 'pending';
  else
    if new.user_id is null then new.user_id := auth.uid(); end if;
    if new.status  is null then new.status  := 'pending'; end if;
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."vd_before_insert_guard"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."vr_before_insert_guard"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  if not is_admin() then
    new.user_id := auth.uid();
    new.status  := 'pending';
  else
    if new.user_id is null then new.user_id := auth.uid(); end if;
    if new.status  is null then new.status  := 'pending'; end if;
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."vr_before_insert_guard"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "user_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone,
    "username" "text",
    "avatar_url" "text",
    "total_reviews" smallint,
    "favourite_venues" "uuid"[] DEFAULT '{}'::"uuid"[],
    "total_venues_added" smallint,
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."venue_details" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "venue_name" "text" NOT NULL,
    "phone_number" "text" NOT NULL,
    "description" "text" NOT NULL,
    "detailed_address" "text",
    "address" "text",
    "city" "text",
    "postcode" "text",
    "website" "text",
    "venue_name_slug" "text",
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "average_heat_rating" real,
    "coords" "jsonb",
    "country" "text",
    "venue_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "total_reviews" smallint,
    "venue_type" "public"."venue_type",
    "hottest_sauces" "text"[],
    "hottest_dishes" "text"[],
    "average_quality_rating" real,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "thumbnail_image" "jsonb",
    "cuisines" "text"[] DEFAULT '{}'::"text"[],
    "dietary_options" "text"[] DEFAULT '{}'::"text"[]
);


ALTER TABLE "public"."venue_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."venue_images" (
    "image_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "venue_id" "uuid" NOT NULL,
    "review_id" "uuid",
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "alt_text" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "image_type" "text",
    "image_path" json
);


ALTER TABLE "public"."venue_images" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."pending_standalone_image_groups" AS
 SELECT "vi"."venue_id",
    "vd"."venue_name",
    "vd"."city",
    "vd"."venue_name_slug",
    "vi"."user_id",
    "p"."username",
    ("count"(*))::integer AS "image_count",
    "max"("vi"."created_at") AS "last_created_at",
    "jsonb_agg"("jsonb_build_object"('imageId', "vi"."image_id", 'createdAt', "vi"."created_at", 'reviewId', "vi"."review_id", 'altText', "vi"."alt_text", 'status', "vi"."status", 'imageType', "vi"."image_type", 'imagePath', "vi"."image_path") ORDER BY "vi"."created_at" DESC) AS "images"
   FROM (("public"."venue_images" "vi"
     JOIN "public"."venue_details" "vd" ON (("vd"."venue_id" = "vi"."venue_id")))
     JOIN "public"."profiles" "p" ON (("p"."user_id" = "vi"."user_id")))
  WHERE ((COALESCE("vi"."status", 'pending'::"text") = 'pending'::"text") AND ("vi"."image_type" = 'standalone'::"text"))
  GROUP BY "vi"."venue_id", "vd"."venue_name", "vd"."city", "vd"."venue_name_slug", "vi"."user_id", "p"."username";


ALTER VIEW "public"."pending_standalone_image_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."unique_cities" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "city" "text" NOT NULL,
    "coords" "jsonb" NOT NULL,
    "country" "text",
    "city_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "city_key" "text" GENERATED ALWAYS AS ((("lower"("regexp_replace"(TRIM(BOTH FROM "city"), '\s+'::"text", ' '::"text", 'g'::"text")) || '|'::"text") || "lower"("regexp_replace"(TRIM(BOTH FROM "country"), '\s+'::"text", ' '::"text", 'g'::"text")))) STORED
);


ALTER TABLE "public"."unique_cities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_roles_role_check" CHECK (("role" = 'admin'::"text"))
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."venue_reviews" (
    "review_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "venue_id" "uuid",
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "heat_rating" real NOT NULL,
    "hottest_dish" "text",
    "hottest_sauce" "text",
    "review_content" "text",
    "review_type" "public"."review_type",
    "review_title" "text",
    "quality_rating" real NOT NULL,
    "status" "text" DEFAULT 'pending'::"text"
);


ALTER TABLE "public"."venue_reviews" OWNER TO "postgres";


ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."unique_cities"
    ADD CONSTRAINT "unique_cities_pkey" PRIMARY KEY ("city_id");



ALTER TABLE ONLY "public"."user_notifications"
    ADD CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("notification_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."venue_details"
    ADD CONSTRAINT "venue_details_id_key" UNIQUE ("venue_id");



ALTER TABLE ONLY "public"."venue_details"
    ADD CONSTRAINT "venue_details_pkey" PRIMARY KEY ("venue_id");



ALTER TABLE ONLY "public"."venue_images"
    ADD CONSTRAINT "venue_images_pkey" PRIMARY KEY ("image_id");



ALTER TABLE ONLY "public"."venue_reviews"
    ADD CONSTRAINT "venue_reviews_pkey" PRIMARY KEY ("review_id");



CREATE INDEX "idx_images_user_standalone_pending" ON "public"."venue_images" USING "btree" ("user_id") WHERE (("image_type" = 'standalone'::"text") AND (COALESCE("status", 'pending'::"text") = 'pending'::"text"));



CREATE INDEX "idx_reviews_user_pending" ON "public"."venue_reviews" USING "btree" ("user_id") WHERE (COALESCE("status", 'pending'::"text") = 'pending'::"text");



CREATE INDEX "idx_reviews_user_venue_created" ON "public"."venue_reviews" USING "btree" ("user_id", "venue_id", "created_at" DESC);



CREATE INDEX "idx_vd_status" ON "public"."venue_details" USING "btree" ("status");



CREATE INDEX "idx_vd_user_status" ON "public"."venue_details" USING "btree" ("user_id", "status");



CREATE INDEX "idx_venue_details_user_id" ON "public"."venue_details" USING "btree" ("user_id");



CREATE INDEX "idx_venue_reviews_user_id" ON "public"."venue_reviews" USING "btree" ("user_id");



CREATE INDEX "idx_venues_user_pending" ON "public"."venue_details" USING "btree" ("user_id") WHERE (COALESCE("status", 'pending'::"text") = 'pending'::"text");



CREATE INDEX "idx_vi_status" ON "public"."venue_images" USING "btree" ("status");



CREATE INDEX "idx_vi_user_type_status" ON "public"."venue_images" USING "btree" ("user_id", "image_type", "status");



CREATE INDEX "idx_vi_venue_status" ON "public"."venue_images" USING "btree" ("venue_id", "status");



CREATE INDEX "idx_vr_status" ON "public"."venue_reviews" USING "btree" ("status");



CREATE INDEX "idx_vr_user_status" ON "public"."venue_reviews" USING "btree" ("user_id", "status");



CREATE INDEX "idx_vr_user_venue_created_at" ON "public"."venue_reviews" USING "btree" ("user_id", "venue_id", "created_at" DESC) WHERE ("status" = ANY (ARRAY['pending'::"text", 'approved'::"text"]));



CREATE UNIQUE INDEX "unique_cities_city_key_idx" ON "public"."unique_cities" USING "btree" ("city_key");



CREATE OR REPLACE TRIGGER "trg_calc_metrics_del" AFTER DELETE ON "public"."venue_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_venue_metrics"();



CREATE OR REPLACE TRIGGER "trg_calc_metrics_ins" AFTER INSERT ON "public"."venue_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_venue_metrics"();



CREATE OR REPLACE TRIGGER "trg_calc_metrics_upd" AFTER UPDATE OF "heat_rating", "quality_rating", "hottest_dish", "hottest_sauce", "review_type", "venue_id" ON "public"."venue_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_venue_metrics"();



CREATE OR REPLACE TRIGGER "trg_enforce_pending_reviews_limit" BEFORE INSERT ON "public"."venue_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_pending_reviews_limit"();



CREATE OR REPLACE TRIGGER "trg_enforce_pending_standalone_images_limit" AFTER INSERT ON "public"."venue_images" REFERENCING NEW TABLE AS "new_images" FOR EACH STATEMENT EXECUTE FUNCTION "public"."enforce_pending_standalone_images_limit"();



CREATE OR REPLACE TRIGGER "trg_enforce_pending_venues_limit" BEFORE INSERT OR UPDATE OF "status" ON "public"."venue_details" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_pending_venues_limit"();



CREATE OR REPLACE TRIGGER "trg_enforce_review_cooldown" BEFORE INSERT ON "public"."venue_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_review_cooldown"();



CREATE OR REPLACE TRIGGER "trg_notify_review_submission" AFTER INSERT ON "public"."venue_reviews" FOR EACH ROW WHEN ((COALESCE("new"."status", 'pending'::"text") = 'pending'::"text")) EXECUTE FUNCTION "public"."notify_review_submission"();



CREATE OR REPLACE TRIGGER "trg_notify_standalone_images" AFTER INSERT ON "public"."venue_images" REFERENCING NEW TABLE AS "new_images" FOR EACH STATEMENT EXECUTE FUNCTION "public"."notify_standalone_images"();



CREATE OR REPLACE TRIGGER "trg_notify_venue_submission" AFTER INSERT ON "public"."venue_details" FOR EACH ROW WHEN ((COALESCE("new"."status", 'pending'::"text") = 'pending'::"text")) EXECUTE FUNCTION "public"."notify_venue_submission"();



CREATE OR REPLACE TRIGGER "trg_review_owner_update_guard" BEFORE UPDATE ON "public"."venue_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."review_owner_update_guard"();



CREATE OR REPLACE TRIGGER "trg_vd_before_insert_guard" BEFORE INSERT ON "public"."venue_details" FOR EACH ROW EXECUTE FUNCTION "public"."vd_before_insert_guard"();



CREATE OR REPLACE TRIGGER "trg_vr_before_insert_guard" BEFORE INSERT ON "public"."venue_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."vr_before_insert_guard"();



CREATE OR REPLACE TRIGGER "update_calculate_venue_metrics_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."venue_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_venue_metrics"();



CREATE OR REPLACE TRIGGER "update_user_review_count_trigger" AFTER INSERT OR DELETE OR UPDATE OF "user_id", "status" ON "public"."venue_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_review_count"();



CREATE OR REPLACE TRIGGER "venue_change_trigger" AFTER INSERT OR DELETE OR UPDATE OF "user_id", "status" ON "public"."venue_details" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_venues_added"();



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."venue_details"
    ADD CONSTRAINT "venue_details_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."venue_images"
    ADD CONSTRAINT "venue_images_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."venue_reviews"("review_id");



ALTER TABLE ONLY "public"."venue_images"
    ADD CONSTRAINT "venue_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."venue_images"
    ADD CONSTRAINT "venue_images_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "public"."venue_details"("venue_id");



ALTER TABLE ONLY "public"."venue_reviews"
    ADD CONSTRAINT "venue_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id");



ALTER TABLE ONLY "public"."venue_reviews"
    ADD CONSTRAINT "venue_reviews_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "public"."venue_details"("venue_id");



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_delete_admin" ON "public"."profiles" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "profiles_select_anyone" ON "public"."profiles" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "profiles_update_owner_admin" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "read_own_role" ON "public"."user_roles" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "uc_delete_admin" ON "public"."unique_cities" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "uc_select_anyone" ON "public"."unique_cities" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "uc_update_admin" ON "public"."unique_cities" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "un_delete_admin" ON "public"."user_notifications" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "un_insert_admin" ON "public"."user_notifications" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "un_select_owner_or_admin" ON "public"."user_notifications" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "un_update_admin" ON "public"."user_notifications" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK (true);



CREATE POLICY "un_update_owner_status" ON "public"."user_notifications" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."unique_cities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "vd_delete_admin" ON "public"."venue_details" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "vd_insert_owner_pending" ON "public"."venue_details" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND (COALESCE("status", 'pending'::"text") = 'pending'::"text")));



CREATE POLICY "vd_select_admin" ON "public"."venue_details" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "vd_select_approved" ON "public"."venue_details" FOR SELECT TO "authenticated", "anon" USING (("status" = 'approved'::"text"));



CREATE POLICY "vd_select_owner_approved_or_admin" ON "public"."venue_details" FOR SELECT TO "authenticated", "anon" USING ((("status" = 'approved'::"text") OR ("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "vd_update_admin" ON "public"."venue_details" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



ALTER TABLE "public"."venue_details" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."venue_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."venue_reviews" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "vi_delete_admin" ON "public"."venue_images" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "vi_insert_owner_pending" ON "public"."venue_images" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND (COALESCE("status", 'pending'::"text") = 'pending'::"text")));



CREATE POLICY "vi_select_admin" ON "public"."venue_images" FOR SELECT TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "vi_select_approved" ON "public"."venue_images" FOR SELECT TO "authenticated", "anon" USING (("status" = 'approved'::"text"));



CREATE POLICY "vi_update_admin" ON "public"."venue_images" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "vr_delete_owner_or_admin" ON "public"."venue_reviews" FOR DELETE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "vr_insert_owner_pending" ON "public"."venue_reviews" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND (COALESCE("status", 'pending'::"text") = 'pending'::"text")));



CREATE POLICY "vr_select_owner_approved_or_admin" ON "public"."venue_reviews" FOR SELECT TO "authenticated", "anon" USING ((("status" = 'approved'::"text") OR ("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "vr_update_admin" ON "public"."venue_reviews" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "vr_update_owner" ON "public"."venue_reviews" FOR UPDATE TO "authenticated" USING ((("user_id" = "auth"."uid"()) AND ("created_at" >= ("now"() - '48:00:00'::interval)))) WITH CHECK ((("user_id" = "auth"."uid"()) AND ("created_at" >= ("now"() - '48:00:00'::interval))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































REVOKE ALL ON FUNCTION "public"."admin_delete_notification"("p_notification_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_delete_notification"("p_notification_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_delete_notification"("p_notification_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_delete_notification"("p_notification_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."user_notifications" TO "anon";
GRANT ALL ON TABLE "public"."user_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."user_notifications" TO "service_role";



GRANT UPDATE("notification_status") ON TABLE "public"."user_notifications" TO "authenticated";



REVOKE ALL ON FUNCTION "public"."admin_insert_notification"("p" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_insert_notification"("p" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_insert_notification"("p" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_insert_notification"("p" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_update_notification"("p_notification_id" "uuid", "patch" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_update_notification"("p_notification_id" "uuid", "patch" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_update_notification"("p_notification_id" "uuid", "patch" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_notification"("p_notification_id" "uuid", "patch" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."calculate_venue_metrics"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."calculate_venue_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_venue_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_venue_metrics"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."can_submit_review"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_submit_review"() TO "anon";
GRANT ALL ON FUNCTION "public"."can_submit_review"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_submit_review"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."can_submit_review_for_venue"("p_venue_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_submit_review_for_venue"("p_venue_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_submit_review_for_venue"("p_venue_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_submit_review_for_venue"("p_venue_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."can_submit_standalone_images"("batch_size" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_submit_standalone_images"("batch_size" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."can_submit_standalone_images"("batch_size" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_submit_standalone_images"("batch_size" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."can_submit_venue"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."can_submit_venue"() TO "anon";
GRANT ALL ON FUNCTION "public"."can_submit_venue"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_submit_venue"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."create_welcome_notification"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_welcome_notification"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_welcome_notification"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_welcome_notification"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."enforce_pending_reviews_limit"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."enforce_pending_reviews_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_pending_reviews_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_pending_reviews_limit"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."enforce_pending_standalone_images_limit"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."enforce_pending_standalone_images_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_pending_standalone_images_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_pending_standalone_images_limit"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."enforce_pending_venues_limit"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."enforce_pending_venues_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_pending_venues_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_pending_venues_limit"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."enforce_review_cooldown"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."enforce_review_cooldown"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_review_cooldown"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_review_cooldown"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_pending_cities"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_pending_cities"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_pending_cities"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_unique_cities"("venue_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_unique_cities"("venue_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unique_cities"("venue_ids" "uuid"[]) TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."notify_review_submission"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notify_review_submission"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_review_submission"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_review_submission"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."notify_standalone_images"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notify_standalone_images"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_standalone_images"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_standalone_images"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."notify_venue_submission"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notify_venue_submission"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_venue_submission"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_venue_submission"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."review_owner_update_guard"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."review_owner_update_guard"() TO "anon";
GRANT ALL ON FUNCTION "public"."review_owner_update_guard"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."review_owner_update_guard"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_user_review_count"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_user_review_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_review_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_review_count"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."update_user_venues_added"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_user_venues_added"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_venues_added"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_venues_added"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."upsert_unique_city"("p_city" "text", "p_country" "text", "p_coords" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."upsert_unique_city"("p_city" "text", "p_country" "text", "p_coords" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_unique_city"("p_city" "text", "p_country" "text", "p_coords" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_unique_city"("p_city" "text", "p_country" "text", "p_coords" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."vd_before_insert_guard"() TO "anon";
GRANT ALL ON FUNCTION "public"."vd_before_insert_guard"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."vd_before_insert_guard"() TO "service_role";



GRANT ALL ON FUNCTION "public"."vr_before_insert_guard"() TO "anon";
GRANT ALL ON FUNCTION "public"."vr_before_insert_guard"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."vr_before_insert_guard"() TO "service_role";


















GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT UPDATE("username") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("avatar_url") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("favourite_venues") ON TABLE "public"."profiles" TO "authenticated";



GRANT ALL ON TABLE "public"."venue_details" TO "anon";
GRANT ALL ON TABLE "public"."venue_details" TO "authenticated";
GRANT ALL ON TABLE "public"."venue_details" TO "service_role";



GRANT ALL ON TABLE "public"."venue_images" TO "anon";
GRANT ALL ON TABLE "public"."venue_images" TO "authenticated";
GRANT ALL ON TABLE "public"."venue_images" TO "service_role";



GRANT ALL ON TABLE "public"."pending_standalone_image_groups" TO "anon";
GRANT ALL ON TABLE "public"."pending_standalone_image_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_standalone_image_groups" TO "service_role";



GRANT ALL ON TABLE "public"."unique_cities" TO "anon";
GRANT ALL ON TABLE "public"."unique_cities" TO "authenticated";
GRANT ALL ON TABLE "public"."unique_cities" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."venue_reviews" TO "anon";
GRANT ALL ON TABLE "public"."venue_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."venue_reviews" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































