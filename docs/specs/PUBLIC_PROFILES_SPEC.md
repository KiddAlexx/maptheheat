# Public Profiles Spec

Living spec for building public user profiles on MapTheHeat in small, reviewable
slices. Update the checkboxes in `Current Status` after each completed step and add
a matching note under `Completed Slices`, so future chats can resume without the
full conversation history.

## Resume Instructions

For a new chat, read `AGENTS.md`, the Supabase workflow at
`docs/guides/SUPABASE_WORKFLOW.md`, and this file, then continue from the first
unchecked item in `Current Status`. Keep each slice scoped to that step. All schema
changes (new columns, the column revoke, favourites RPCs) go through migration files per
`docs/specs/SUPABASE_MIGRATIONS_SPEC.md` — never edit schema directly. Keep public
reads approved-only. Run `npm.cmd run checks` plus the relevant tests after each slice.

After completing any step, always output:
1. A git commit message (message string only, no extra commentary). Use a conventional
   commit subject line. Do not include a step reference (e.g., "Step 6") anywhere in the
   message. Add a bullet-point body only when there are multiple distinct changes worth
   calling out individually; omit the body for simple, single-concern commits.
2. A resume prompt — a self-contained paragraph the user can paste at the start of the
   next chat to pick up exactly where this one left off (what was just completed, what
   Docker/staging state to expect, and which step comes next).

## Context

We now display "Added by [username]" on the venue detail page, and reviews already
show their author's username publicly. The natural next step is a public profile
page per user, linked from those attributions, showing what that user has
contributed. Because this aggregates a user's activity into one browsable place, it
must be built carefully so it can **never** expose the user's private profile data
or settings.

## Core Principles (do not violate)

- **`profiles` stays publicly readable; only `favourite_venues` is protected.** Almost
  every `profiles` column (`username, avatar_url, total_reviews, total_venues_added`)
  is public by design — already shown on every review and venue. The **only** sensitive
  column is `favourite_venues`. So we do **not** lock the table, build an attribution
  RPC, or refactor `Avatar` — existing reads (`Avatar`, `getReviews` `profiles(*)`,
  `getVenue` `profiles(username)`, the live "Added by") keep working untouched. We only
  make `favourite_venues` private. (Email is not on `profiles` — it is in `auth.users`.)
- **Protect `favourite_venues` at the DB layer, not in the app.** App-level narrowing is
  not real security: any client can run `select favourite_venues from profiles`. Revoke
  the column and serve favourites through small `SECURITY DEFINER` RPCs (see Step 2).
- **Writes are already owner-only.** `profiles` UPDATE/INSERT is owner-only and DELETE is
  admin-only (`profiles_update_owner_admin`, etc.). A user can already only change their
  own row — verify, no change needed.
- **Public reads are approved-only.** Venues and reviews shown on a public profile must
  be filtered to `status = 'approved'`. Existing RLS already permits approved content for
  any user (`vd_select_approved`, `vr_select_owner_approved_or_admin`), so verify, don't
  broaden.
- **`is_public` gates the page, not the row.** A private profile renders no public page
  and no link; private == missing for the route (same 404 + `noindex`). The `profiles`
  row staying readable is fine — it holds only public-anyway data.
- **The private profile is the superset.** Public profiles are built from the same
  building blocks (banner, venues-added list, reviews list) shown in a stripped-down,
  read-only form. The private profile adds private-only tabs (Notifications, Edit). Build
  each shared list/banner once and mount it in both places; never surface a private-only
  piece on the public path.

## Verified preconditions (from the current schema/code)

- `profiles` columns: `user_id, updated_at, username, avatar_url, total_reviews,
  favourite_venues (uuid[]), total_venues_added`. **No `created_at`** — join date must
  be added and backfilled from `auth.users.created_at` (not `default now()`).
- `favourite_venues` is the only sensitive column and is currently world-readable via
  `profiles_select_anyone` / `Public profiles are viewable by everyone` (`USING (true)`).
- `total_reviews` / `total_venues_added` are already maintained **approved-only** by
  trigger, so banner counts match the approved lists.
- Favourites read/write today: `getUserProfile` selects `*`, and `updateFavouriteVenue`
  ([apiUserProfiles.ts](../../src/services/apiUserProfiles.ts)) selects + rewrites the
  array. Both run as the owner, so both move onto the new favourites RPCs once the column
  is revoked.
- Author FKs `venue_details.user_id` and `venue_reviews.user_id` reference `profiles`
  with **no `ON DELETE`** action, while `auth.users → profiles` is `CASCADE`. Deleting
  a contributing user is therefore blocked — erasure needs an anonymise/`SET NULL`
  strategy before it can work.

## Decisions (locked for v1)

- **Profile URL:** keyed by **user id** for now, e.g. `/user/:userId` (kept separate
  from the private `/profile/*` routes). Username-based URLs are a future
  consideration — see below.
- **Private scope:** opting out **hides the public page and the profile link only**;
  the username still appears as plain text on the user's venues/reviews
  (attribution kept for review trust).
- **Favourites:** **private by default**, with an opt-in toggle to show them on the
  public profile.
- **v1 content:** reuse the existing profile banner (avatar, username, review count,
  venues-added count) in a read-only form, plus the join date, plus a **Venues Added**
  list and a **Reviews left** list. The Venues Added list shows on **both** the private
  and public profile, and reuses the same search/filter UI as the favourites list
  (`VenueListContainer` → `SearchAndFilterPanel` + `VenueListView`). Favourites list
  only when opted in.
- **Favourites privacy via column revoke + small RPCs**, not a table lock. Revoke
  `SELECT (favourite_venues)`; owner reads/toggles via `SECURITY DEFINER` RPCs; opt-in
  public favourites via a gated RPC. Everything else on `profiles` stays public.
- **Defined edge behaviours:** private == missing (same 404, both `noindex`); malformed
  / non-uuid id → not-found; username-less profile → not linkable (treated like private
  for linking); opting out of a public profile **preserves** `show_favourites` (so
  re-enabling restores prior choice); every list has empty and error states.
- **Independent list state.** The added-venues list gets its own pagination/filter
  context — it must not share `UserFavVenuesContext` with the favourites list, or the
  two lists on the private profile will fight over state.
- **Legacy redirect.** `/profile/venues` redirects to `/profile/favourite-venues` after
  the tab-key rename.
- **Settings:** a new **Privacy** section in the profile settings holds the toggles:
  "Public profile" (default ON / opted in, can opt out) and "Show my favourites on my
  profile" (default OFF / opt in).
- **Tab keys / URL slugs:** rename the Favourites tab key `venues` → `favourite-venues`
  and add `added-venues` for the new Venues Added tab. The Tab `key` is the
  `/profile/:section` URL slug, so use lowercase, hyphenated, grammatical names. This
  replaces the current confusing `/profile/venues` (which actually shows favourites).

## Goals

- Make `favourite_venues` private (default), owner-readable, opt-in public — the only
  data-security work needed.
- Public, read-only profile pages at `/user/:userId`, built as a subset of the
  private profile's building blocks.
- A "Venues Added" list that appears on **both** profiles and reuses the favourites
  list's search/filter UI.
- Privacy controls in settings, defaulting to public profile + private favourites.
- "Added by" / review-author names link to the public profile, plain text when private.

## Current Status

- [x] Step 1: Schema migration — add `is_public`, `show_favourites`, `created_at` (backfilled from `auth.users`).
- [x] Step 2: Make favourites private — revoke `SELECT (favourite_venues)`; add owner + public favourites `SECURITY DEFINER` RPCs; move `apiUserProfiles` favourites read/toggle onto them.
- [x] Step 3: Build the shared "Venues Added" list (approved-only, by user id, favourites-style search/filter, own list state).
- [x] Step 4: Mount "Venues Added" as a new tab on the private profile (+ tab-key rename + `/profile/venues` redirect).
- [x] Step 5: Add public profile read service + hook (`getPublicProfile`) reading the public `profiles` row; same not-found for private/missing.
- [x] Step 6: Add `/user/:userId` route + page shell (private==missing 404, malformed id, `noindex`).
- [x] Step 7: Add a read-only banner variant (no settings cog) with join date.
- [x] Step 8: Mount Venues Added + Reviews-left on the public profile.
- [ ] Step 9: Add the conditional public "Favourites" list (only when opted in).
- [ ] Step 10: Add the Privacy settings section with the two toggles + update service/hook.
- [ ] Step 11: Link "Added by" and review-author names to `/user/:userId` (plain text when private/unlinkable).
- [ ] Step 12: Account deletion — anonymise / `SET NULL` author FKs + avatar storage cleanup.
- [ ] Step 13: Cover the public profile flow with tests.
- [ ] Step 14: Update the Privacy Policy (depends on Step 12).

## Step Detail

Migration slices (Steps 1, 2, 12) go through migration files per
`docs/specs/SUPABASE_MIGRATIONS_SPEC.md` and should be validated with `supabase db reset`
alongside `npm.cmd run checks`.

**Deployment rule: staging gets each migration as it is completed and validated. Production
gets all migrations in one batch only after every step is done and the full feature is
tested on staging. Never push to production mid-feature.**

### Step 1: Schema migration — columns + join date
- Add to `profiles`: `is_public boolean not null default true`,
  `show_favourites boolean not null default false`, and `created_at timestamptz`.
- Backfill `created_at` from `auth.users.created_at` (do **not** use `default now()`,
  which would stamp existing users with the migration date). Expose only month/year in UI.

### Step 2: Make favourites private (column revoke + RPCs)
- Migration: `REVOKE SELECT (favourite_venues) ON public.profiles FROM anon, authenticated`
  (mirrors the existing `GRANT UPDATE(favourite_venues)` column grant). Everything else on
  `profiles` stays publicly readable.
- Add `SECURITY DEFINER` RPCs (mirror the existing pattern,
  `SET search_path TO 'public', 'pg_temp'`):
  - owner read + toggle (e.g. `get_my_favourites()` and `toggle_favourite(venue_id)`), since
    revoking the column means the owner can no longer read it via a normal select;
  - `get_public_favourites(user_id)` returning the target's **approved** favourite venues
    only when `is_public && show_favourites` — never the raw array or the profile row.
- Move [apiUserProfiles.ts](../../src/services/apiUserProfiles.ts) onto these: `getUserProfile`
  stops relying on `*` returning favourites; `updateFavouriteVenue` becomes the toggle RPC.
  Update the owner-favourites consumers (`UserProfile`, `DetailedVenueView` `isFavourite`,
  the favourites `VenueListContainer`).
- Note: `getReviews`'s `profiles(*)` automatically stops returning favourites after the
  revoke — no change needed there; `Avatar`, `getVenue`, and "Added by" are untouched.

### Step 3: Shared "Venues Added" list
- Build one reusable list of **approved** venues where `user_id = :targetUserId`,
  parameterised by user id (defaults to the logged-in user on the private profile).
- Reuse the favourites list's search/filter UX (`VenueListContainer` wraps
  `SearchAndFilterPanel` + `VenueListView`). Give it its **own** pagination/sort context
  (do not share `UserFavVenuesContext`), since the data source is "venues by author".
- **Replace URL-based mode detection.** `SearchAndFilterPanel`, `VenueListView`,
  `VenueListCard`, `CitySelect` detect mode via `useMatch('/profile/venues')`. These
  components now render at multiple URLs, so swap the hardcoded match for an explicit
  prop/context flag.

### Step 4: Mount on the private profile (+ rename + redirect)
- Add an "Added" tab to `UserProfile.tsx` rendering the Step 3 list for the logged-in
  user. Rename the Favourites tab key `venues` → `favourite-venues`, add `added-venues`,
  update the four `useMatch` sites + the `navigate`/default, and add a
  `/profile/venues` → `/profile/favourite-venues` redirect.

### Step 5: Public profile read service + hook
- Add `getPublicProfile(userId)` reading the (public) `profiles` row plus the join date,
  returning the same null/not-found when `is_public` is false or the row is missing. Add a
  `useGetPublicProfile` hook with a query key distinct from the private `useGetUserProfile`.

### Step 6: Public route + page shell
- Add `/user/:userId`. Private and missing return the same not-found state; malformed /
  non-uuid id → not-found; set `noindex` for not-found/private pages.

### Step 7: Read-only banner
- Make `UserProfileBanner`'s `onEditClick` optional: when absent, hide the settings cog.
  Reuse on the public page. Add the join date line ("Member since June 2026").

### Step 8: Public contribution lists
- Mount the shared Venues Added list (Step 3) for the target user, plus a Reviews-left
  list — a variant of `ReviewContainer`/its query fetching **approved** reviews by the
  target `userId`.

### Step 9: Conditional favourites list
- Render only when the target's `show_favourites` is true, fed by `get_public_favourites`
  (Step 2). Reuse the favourites list UI.

### Step 10: Privacy settings
- Add a "Privacy" section to `EditProfilePanel` with two toggles: "Public profile"
  (default ON) and "Show my favourites on my profile" (default OFF). Opting out of public
  preserves `show_favourites`. Add an update service + hook writing `is_public` /
  `show_favourites` (owner-only via existing `profiles_update_owner_admin`).

### Step 11: Link attributions
- Point the "Added by" name in `DetailedVenueView` and review-author names to
  `/user/:userId`. Render plain text (no link) when the target is private or has no
  username. `is_public` is already on the public-readable `profiles` row, so no extra
  contract is needed.

### Step 12: Account deletion
- Decide and implement erasure: make author FKs `venue_details.user_id` /
  `venue_reviews.user_id` `ON DELETE SET NULL` (and the columns nullable), or reassign to
  a sentinel "deleted user", so deleting an `auth.users` row no longer blocks on the
  `profiles` cascade. Include avatar storage cleanup. This unblocks the policy step.

### Step 13: Tests
- Service + component coverage: public vs private profile, favourites opt-in on/off,
  approved-only filtering, not-found state, the read-only banner (no cog), and the shared
  Venues Added list on both profiles. Include a check that `favourite_venues` is not
  returned to a non-owner (e.g. the public favourites RPC respects both toggles).

### Step 14: Privacy Policy (depends on Step 12)
- Disclose that public profiles exist and what they show (username, avatar, counts, join
  date, contributions, and favourites when opted in). Document the implemented account-
  deletion / anonymisation behaviour.

## Future Considerations (not in v1)

- **Username-based URLs** (`/user/:username`) instead of ids. The challenge is
  username changes breaking old links. Options to discuss when we get there:
  - *Accept breakage*: old links 404 after a rename (simple; how Twitter/X handles it).
  - *Username history table*: map old usernames → `user_id` and 301-redirect to the
    current handle (no broken links, small table to maintain).
  - *Id + slug hybrid* (recommended): `/user/:userId/:usernameSlug` where the id is
    the source of truth and the slug is cosmetic; renames never break links and the
    canonical slug can redirect (how Stack Overflow does question URLs). This is
    forward-compatible with the id-based v1 — the id stays in the path.
- **More profile content**: short bio (needs a field + settings input + moderation),
  contribution stats/streaks, badges.
- **De-attribution option**: v1 keeps attribution when private; a stronger "appear as
  a community member everywhere" mode could be offered later.
- **Visibility of the favourites count** vs the favourites list itself.

## Completed Slices

### Step 8: Public contribution lists (2026-06-22)

- Added `authorUserId?: string` to `ReviewContainerProps` in `ReviewContainer.tsx`; when provided, it replaces `useUser().id` as the target for the reviews query. The `isPendingUser` guard is skipped when `authorUserId` is supplied directly.
- Lazy-loaded `ReviewContainer` and `VenueListContainer` in `PublicProfile.tsx`; added `Tab`/`Tabs` from HeroUI and `Icon` from `@iconify/react`.
- Composed two tabs directly in `PublicProfile.tsx` (no shared shell): "Added" renders `<VenueListContainer mode="added" authorUserId={publicProfile.userId} />` and "Reviews" renders `<ReviewContainer mode="user" authorUserId={publicProfile.userId} />`, each in a `Suspense` boundary.
- `npm run checks` passes (zero lint/type errors). No migration -- Step 8 is frontend-only.

### Step 7: Read-only banner (2026-06-22)

- Made `onEditClick` optional in `UserProfileBanner` (`onEditClick?: () => void`); the settings cog button renders only when the prop is provided.
- Added `createdAt` destructure and a "Member since [Month Year]" line (`date-fns` `format`/`parseISO`) rendered below the stats row when `createdAt` is non-null.
- Imported `UserProfileBanner` into `PublicProfile.tsx` and mounted it inside the content div; no `onEditClick` prop so the cog is absent on the public page.
- `npm run checks` passes (zero lint/type errors). Frontend-only -- no migration.

### Step 6: Public route + page shell (2026-06-22)

- Created `src/pages/PublicProfile.tsx`: reads `:userId` from route params, validates against a UUID regex, calls `useGetPublicProfile` (disabled when id is invalid). Non-UUID ids and null/private profiles all render `<PageNotFound />` with a `<Helmet>` injecting `<meta name="robots" content="noindex" />`. Valid profiles render a `<main>` with `<PageSeo>` (placeholder `<div>` for Steps 7-9 content).
- Lazy-loaded `PublicProfile` in `App.tsx` and registered `<Route path="/user/:userId" element={<PublicProfile />} />` inside `<RootLayout>`, alongside the other public routes.
- `npm run checks` passes (zero lint/type errors). No migration -- Step 6 is frontend-only.

### Step 5: Public profile read service + hook (2026-06-22)

- Added `getPublicProfile(userId)` to `src/services/apiUserProfiles.ts`: selects the same explicit column list as `getUserProfile` (no `favourite_venues`), returns `null` when the row is missing or `is_public` is false, otherwise returns the camelcased `Profile`.
- Created `src/features/userProfile/hooks/useGetPublicProfile.ts`: `useQuery` with key `['publicProfile', userId]` (distinct from `['profile', userId]`), `enabled: !!userId`, returns `{ isLoading, error, publicProfile }`.
- `npm run checks` passes (zero lint/type errors). No migration -- Step 5 is frontend-only.

### Step 4: Mount Venues Added tab on private profile (2026-06-22)

- Renamed the Favourites tab key in `UserProfile.tsx` from `"venues"` to `"favourite-venues"`.
- Added an "Added" tab (`key="added-venues"`) rendering `<VenueListContainer mode="added" authorUserId={userId} />` inside a `Suspense` boundary.
- Added a `<Route path="/profile/venues" element={<Navigate replace to="/profile/favourite-venues" />}` in `App.tsx` (placed before the parameterised `/profile/:section?/:setting?` route so it takes priority).
- No `useMatch` sites needed updating -- those were already replaced with explicit `isUserMode` props in Step 3.
- `npm run checks` passes (zero lint/type errors). No migration -- Step 4 is frontend-only.

### Step 1: Schema migration (2026-06-22)

- Created `supabase/migrations/20260622120000_profiles_add_public_columns.sql`.
- Added `is_public boolean NOT NULL DEFAULT true` and `show_favourites boolean NOT NULL DEFAULT false` to `profiles`.
- Added `created_at timestamptz` (nullable; no `DEFAULT now()` to avoid stamping existing users with the migration date).
- Backfill `UPDATE profiles SET created_at = auth.users.created_at` for all existing rows.
- Updated `handle_new_user()` to include `created_at = new.created_at` in its insert so future signups populate the column.
- `npm run checks` passes; `supabase db reset` replayed all migrations cleanly locally.
- Pushed to staging (`iuhgmfdpeblaaoolhpbt`) with `supabase db push`. Migration applied successfully.

### Step 3: Shared "Venues Added" list (2026-06-22)

- Created `src/context/UserAddedVenuesContext.tsx` — independent pagination/filter/sort context (same reducer shape as `UserFavVenuesContext`); registered `UserAddedVenuesProvider` in `AppProviders.tsx`.
- Added `authorUserId?: string` to `VenuesRequestParams` / `getVenues` in `apiVenues.ts`; when provided, applies `.eq('user_id', authorUserId)` after the `status = 'approved'` guard.
- Updated `useVenues` to accept and forward `authorUserId`; included in the query key.
- Replaced `useMatch('/profile/venues')` with an explicit `isUserMode?: boolean` prop in `CitySelect`, `SearchAndFilterPanel`, `VenueListView`, and `VenueListCard` — these components now work at any URL.
- `CitySelect` decoupled city-list logic from URL: user-specific city list shown when `favouriteVenues` is provided (not based on URL); map navigation suppressed when `isUserMode` is true.
- `VenueListContainer` extended: `mode` accepts `'venue' | 'user' | 'added'`; `'added'` selects `useUserAddedVenuesContext` and accepts `authorUserId`; `isUserMode` computed from mode and forwarded to both children.
- `npm run checks` passes (zero lint/type errors). No migration — Step 3 is frontend-only.

### Step 2: Make favourites private (2026-06-22)

- Created `supabase/migrations/20260622130000_make_favourites_private.sql`.
- `REVOKE SELECT (favourite_venues) ON public.profiles FROM anon, authenticated` -- column-level read is now blocked; the existing `GRANT UPDATE(favourite_venues)` column grant is unchanged.
- Added `get_my_favourites()` SECURITY DEFINER RPC: returns `uuid[]` for `auth.uid()`; safe no-op for unauthenticated callers.
- Added `toggle_favourite(p_venue_id uuid)` SECURITY DEFINER RPC: atomically toggles the venue in/out of the array and returns the new array.
- Added `get_public_favourites(p_user_id uuid)` SECURITY DEFINER RPC: returns approved venue IDs only when `is_public AND show_favourites`; never exposes the raw array.
- `getUserProfile` in `apiUserProfiles.ts` now selects explicit columns (no `favourite_venues`).
- Added `getMyFavourites()` service function (calls `get_my_favourites` RPC).
- Replaced `updateFavouriteVenue` / `AddFavouriteVenueParams` with `toggleFavouriteVenue(venueId)` (calls `toggle_favourite` RPC atomically).
- `Profile` type updated: removed `favouriteVenues`, added `isPublic`, `showFavourites`, `createdAt`.
- New `useGetMyFavourites(userId)` hook with query key `['myFavourites', userId]`.
- `useUpdateFavouriteVenue` now calls `toggleFavouriteVenue`; invalidates `['myFavourites']` and `['userCities']` (no longer `['profile']`).
- `UserProfile`, `DetailedVenueView`, `VenueListView` all switched to `useGetMyFavourites`; `VenueListCard` toggle calls updated to pass `venueId` string directly.
- `supabase db reset` replayed all migrations cleanly; `npm run checks` passes (zero lint/type errors).
- Pushed to staging; `supabase db push` applied `20260622130000_make_favourites_private.sql`.
