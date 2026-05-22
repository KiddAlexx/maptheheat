-- Resolve Supabase Advisor security/performance findings without removing
-- intended authenticated RPCs used by the app for fast UI permission checks.

-- Views should evaluate underlying table privileges/RLS as the querying user.
alter view public.pending_standalone_image_groups
  set (security_invoker = true);

revoke all on table public.pending_standalone_image_groups from anon;
revoke all on table public.pending_standalone_image_groups from authenticated;
grant select on table public.pending_standalone_image_groups to authenticated;
grant select on table public.pending_standalone_image_groups to service_role;

-- Functions exposed to the browser should either be invoker-safe or not
-- directly executable. Keep intentional authenticated RPCs callable.
alter function public.admin_delete_notification(uuid) security invoker;
alter function public.admin_insert_notification(jsonb) security invoker;
alter function public.admin_update_notification(uuid, jsonb) security invoker;
alter function public.can_submit_review() security invoker;
alter function public.can_submit_review_for_venue(uuid) security invoker;
alter function public.can_submit_standalone_images(integer) security invoker;
alter function public.can_submit_venue() security invoker;
alter function public.is_admin() security invoker;
alter function public.upsert_unique_city(text, text, jsonb) security invoker;

alter function public.get_pending_cities() set search_path = public, pg_temp;
alter function public.get_unique_cities(uuid[]) set search_path = public, pg_temp;

revoke execute on function public.admin_delete_notification(uuid) from public, anon, authenticated;
revoke execute on function public.admin_insert_notification(jsonb) from public, anon, authenticated;
revoke execute on function public.admin_update_notification(uuid, jsonb) from public, anon, authenticated;
revoke execute on function public.can_submit_review() from public, anon, authenticated;
revoke execute on function public.can_submit_review_for_venue(uuid) from public, anon, authenticated;
revoke execute on function public.can_submit_standalone_images(integer) from public, anon, authenticated;
revoke execute on function public.can_submit_venue() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon, authenticated;
revoke execute on function public.upsert_unique_city(text, text, jsonb) from public, anon, authenticated;

grant execute on function public.admin_delete_notification(uuid) to authenticated;
grant execute on function public.admin_insert_notification(jsonb) to authenticated;
grant execute on function public.admin_update_notification(uuid, jsonb) to authenticated;
grant execute on function public.can_submit_review() to authenticated;
grant execute on function public.can_submit_review_for_venue(uuid) to authenticated;
grant execute on function public.can_submit_standalone_images(integer) to authenticated;
grant execute on function public.can_submit_venue() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.upsert_unique_city(text, text, jsonb) to authenticated;

-- Trigger/internal SECURITY DEFINER functions should only run through their
-- triggers or privileged server-side contexts, never through public REST RPC.
revoke execute on function public.calculate_venue_metrics() from public, anon, authenticated;
revoke execute on function public.create_welcome_notification() from public, anon, authenticated;
revoke execute on function public.enforce_pending_reviews_limit() from public, anon, authenticated;
revoke execute on function public.enforce_pending_standalone_images_limit() from public, anon, authenticated;
revoke execute on function public.enforce_pending_venues_limit() from public, anon, authenticated;
revoke execute on function public.enforce_review_cooldown() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.notify_review_submission() from public, anon, authenticated;
revoke execute on function public.notify_standalone_images() from public, anon, authenticated;
revoke execute on function public.notify_venue_submission() from public, anon, authenticated;
revoke execute on function public.update_user_review_count() from public, anon, authenticated;
revoke execute on function public.update_user_venues_added() from public, anon, authenticated;

-- Keep public object URLs usable while removing bucket-wide object listing.
drop policy if exists "Public read access" on storage.objects;
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
drop policy if exists "allow all access temporarily 1u0al2_0" on storage.objects;

-- RLS policy cleanup: use init-plan-safe function calls and collapse duplicate
-- permissive policies that checked the same role/action combinations.
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;

alter policy "Users can insert their own profile." on public.profiles
  with check ((select auth.uid()) = user_id);

alter policy profiles_delete_admin on public.profiles
  using ((select public.is_admin()));

alter policy profiles_update_owner_admin on public.profiles
  using ((user_id = (select auth.uid())) or (select public.is_admin()))
  with check ((user_id = (select auth.uid())) or (select public.is_admin()));

alter policy read_own_role on public.user_roles
  using (user_id = (select auth.uid()));

alter policy uc_delete_admin on public.unique_cities
  using ((select public.is_admin()));

alter policy uc_update_admin on public.unique_cities
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists uc_insert_authenticated on public.unique_cities;
create policy uc_insert_authenticated
  on public.unique_cities
  for insert
  to authenticated
  with check (
    city is not null
    and btrim(city) <> ''
    and country is not null
    and btrim(country) <> ''
    and coords is not null
    and coords ? 'lat'
    and (coords ? 'lon' or coords ? 'lng')
  );

alter policy un_delete_admin on public.user_notifications
  using ((select public.is_admin()));

alter policy un_insert_admin on public.user_notifications
  with check ((select public.is_admin()));

alter policy un_select_owner_or_admin on public.user_notifications
  using ((user_id = (select auth.uid())) or (select public.is_admin()));

drop policy if exists un_update_admin on public.user_notifications;
drop policy if exists un_update_owner_status on public.user_notifications;
create policy un_update_owner_or_admin
  on public.user_notifications
  for update
  to authenticated
  using ((user_id = (select auth.uid())) or (select public.is_admin()))
  with check ((user_id = (select auth.uid())) or (select public.is_admin()));

alter policy uc_select_anyone on public.unique_cities
  using (true);

drop policy if exists vd_select_admin on public.venue_details;
drop policy if exists vd_select_approved on public.venue_details;
drop policy if exists vd_select_owner_approved_or_admin on public.venue_details;
create policy vd_select_approved_anon
  on public.venue_details
  for select
  to anon
  using (status = 'approved'::text);
create policy vd_select_authenticated
  on public.venue_details
  for select
  to authenticated
  using (
    status = 'approved'::text
    or user_id = (select auth.uid())
    or (select public.is_admin())
  );

alter policy vd_delete_admin on public.venue_details
  using ((select public.is_admin()));

alter policy vd_insert_owner_pending on public.venue_details
  with check (
    user_id = (select auth.uid())
    and coalesce(status, 'pending'::text) = 'pending'::text
  );

alter policy vd_update_admin on public.venue_details
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists vi_select_admin on public.venue_images;
drop policy if exists vi_select_approved on public.venue_images;
create policy vi_select_approved_anon
  on public.venue_images
  for select
  to anon
  using (status = 'approved'::text);
create policy vi_select_authenticated
  on public.venue_images
  for select
  to authenticated
  using (
    status = 'approved'::text
    or user_id = (select auth.uid())
    or (select public.is_admin())
  );

alter policy vi_delete_admin on public.venue_images
  using ((select public.is_admin()));

alter policy vi_insert_owner_pending on public.venue_images
  with check (
    user_id = (select auth.uid())
    and coalesce(status, 'pending'::text) = 'pending'::text
  );

alter policy vi_update_admin on public.venue_images
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

alter policy vr_delete_owner_or_admin on public.venue_reviews
  using ((user_id = (select auth.uid())) or (select public.is_admin()));

alter policy vr_insert_owner_pending on public.venue_reviews
  with check (
    user_id = (select auth.uid())
    and coalesce(status, 'pending'::text) = 'pending'::text
  );

alter policy vr_select_owner_approved_or_admin on public.venue_reviews
  using (
    status = 'approved'::text
    or user_id = (select auth.uid())
    or (select public.is_admin())
  );

drop policy if exists vr_update_admin on public.venue_reviews;
drop policy if exists vr_update_owner on public.venue_reviews;
create policy vr_update_owner_or_admin
  on public.venue_reviews
  for update
  to authenticated
  using (
    (select public.is_admin())
    or (
      user_id = (select auth.uid())
      and created_at >= (now() - '48:00:00'::interval)
    )
  )
  with check (
    (select public.is_admin())
    or (
      user_id = (select auth.uid())
      and created_at >= (now() - '48:00:00'::interval)
    )
  );

alter table public.venue_images
  drop constraint if exists venue_images_venue_id_fkey;

alter table public.venue_reviews
  drop constraint if exists venue_reviews_venue_id_fkey;

alter table public.venue_details
  drop constraint if exists venue_details_id_key;

alter table public.venue_images
  add constraint venue_images_venue_id_fkey
  foreign key (venue_id) references public.venue_details(venue_id);

alter table public.venue_reviews
  add constraint venue_reviews_venue_id_fkey
  foreign key (venue_id) references public.venue_details(venue_id);
