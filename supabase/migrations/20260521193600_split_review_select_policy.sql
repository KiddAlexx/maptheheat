-- Keep anonymous review reads on the approved-content path only.
-- Authenticated users still need to see their own pending reviews and admin-only
-- review rows, but anon cannot execute is_admin().

drop policy if exists vr_select_owner_approved_or_admin on public.venue_reviews;

create policy vr_select_approved_anon
  on public.venue_reviews
  for select
  to anon
  using (status = 'approved'::text);

create policy vr_select_authenticated
  on public.venue_reviews
  for select
  to authenticated
  using (
    status = 'approved'::text
    or user_id = (select auth.uid())
    or (select public.is_admin())
  );
