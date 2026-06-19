# Public Profiles Spec

Living spec for building public user profiles on MapTheHeat in small, reviewable
slices. Update the checkboxes in `Current Status` after each completed step and add
a matching note under `Completed Slices`, so future chats can resume without the
full conversation history.

## Resume Instructions

For a new chat, read `AGENTS.md`, the Supabase workflow at
`docs/guides/SUPABASE_WORKFLOW.md`, and this file, then continue from the first
unchecked item in `Current Status`. Keep each slice scoped to that step. All schema
changes (new columns, the public view, RLS) go through migration files per
`docs/specs/SUPABASE_MIGRATIONS_SPEC.md` — never edit schema directly. Keep public
reads approved-only and limited to public-safe columns. Run `npm.cmd run checks`
plus the relevant tests after each slice.

## Context

We now display "Added by [username]" on the venue detail page, and reviews already
show their author's username publicly. The natural next step is a public profile
page per user, linked from those attributions, showing what that user has
contributed. Because this aggregates a user's activity into one browsable place, it
must be built carefully so it can **never** expose the user's private profile data
or settings.

## Core Principles (do not violate)

- **The public profile must never leak private data.** No email, notification data,
  account settings, raw favourites (unless explicitly made public), or any private
  profile field may ever be reachable through the public profile path. Enforce this
  at the data layer (a dedicated public view / service that selects only safe
  columns), not just in the UI.
- **Public reads are approved-only.** Venues and reviews shown on a public profile
  must be filtered to `status = 'approved'`, exactly like other public services.
- **Respect visibility.** A private profile (opted out) returns not-found for its
  public page; its contributions still show the username as plain text on venues/
  reviews, but with no link to a profile.
- **Keep private and public profiles separate.** The existing private profile lives
  at `/profile/*` and is driven by the logged-in user. The public profile is a
  distinct route and a distinct read path. Do not extend the private
  `getUserProfile` to serve public requests.
- **The private profile is the superset.** Public profiles are built from the same
  building blocks (banner, venues-added list, reviews list) shown in a stripped-down,
  read-only form. The private profile shows everything the public one does, plus
  private-only tabs (Notifications, Edit). Build each shared list/banner once and
  mount it in both places; never surface a private-only piece on the public path.

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
- **RLS will need adjusting.** Reading another user's approved venues/reviews by
  `user_id`, and gating favourites on `show_favourites`, requires RLS/policy changes —
  call these out explicitly in the migration steps.
- **Settings:** a new **Privacy** section in the profile settings holds the toggles:
  "Public profile" (default ON / opted in, can opt out) and "Show my favourites on my
  profile" (default OFF / opt in).
- **Tab keys / URL slugs:** rename the Favourites tab key `venues` → `favourite-venues`
  and add `added-venues` for the new Venues Added tab. The Tab `key` is the
  `/profile/:section` URL slug, so use lowercase, hyphenated, grammatical names. This
  replaces the current confusing `/profile/venues` (which actually shows favourites).

## Goals

- Public, read-only profile pages at `/user/:userId`, built as a subset of the
  private profile's building blocks.
- A "Venues Added" list that appears on **both** profiles and reuses the favourites
  list's search/filter UI.
- Reuse `UserProfileBanner` (read-only variant) and approved-only contribution lists.
- A safe public read path that exposes only whitelisted columns and respects the
  public/private toggle.
- Privacy controls in settings, defaulting to public profile + private favourites.
- Link the existing "Added by" and review-author names to the public profile
  (plain text when the profile is private).

## Current Status

- [ ] Step 1: Add visibility columns + join-date access (migration).
- [ ] Step 2: Adjust RLS + add a `public_profiles` safe view (migration).
- [ ] Step 3: Add public profile read service + hook (`getPublicProfile`).
- [ ] Step 4: Build the shared "Venues Added" list (approved-only, by user id, favourites-style search/filter).
- [ ] Step 5: Mount "Venues Added" as a new tab on the private profile.
- [ ] Step 6: Add `/user/:userId` route and page shell with not-found / private states.
- [ ] Step 7: Add a read-only banner variant (no settings cog) with join date.
- [ ] Step 8: Mount Venues Added + Reviews-left on the public profile.
- [ ] Step 9: Add the conditional public "Favourites" list (only when opted in).
- [ ] Step 10: Add the Privacy settings section with the two toggles + update service/hook.
- [ ] Step 11: Link "Added by" and review-author names to `/user/:userId` (plain text when private).
- [ ] Step 12: Security pass — verify no private fields leak and visibility is enforced.
- [ ] Step 13: Cover the public profile flow with tests.
- [ ] Step 14: Update the Privacy Policy to disclose public profiles + account-deletion behaviour.

## Step Detail

### Step 1: Visibility columns + join date (migration)
- Add to `profiles` via migration: `is_public boolean not null default true` and
  `show_favourites boolean not null default false`.
- Confirm `profiles.created_at` exists for the join date; if not, source it from the
  auth user. Expose only month/year granularity in the UI.

### Step 2: RLS adjustments + public-safe view (migration)
- **RLS:** allow anon/authenticated to read **approved** venues and reviews by any
  `user_id` (so the lists work for other users), and gate favourites reads on the
  target's `show_favourites`. Audit existing `profiles` / `venue_details` /
  `venue_reviews` policies and adjust as needed — this is the main RLS surface.
- Create a `public_profiles` view (`security_invoker = true`) selecting **only** safe
  columns: `user_id`, `username`, `total_reviews`, `total_venues_added`, `created_at`,
  `show_favourites`, filtered to `is_public = true`.
- Avatars are already public (served from the `avatars` bucket by `user_id`), so the
  read-only `Avatar` component works unchanged.
- Verify private columns (email, etc.) on the base `profiles` table are not newly
  exposed.

### Step 3: Public read service + hook
- Add `getPublicProfile(userId)` in a public service (e.g. `apiUserProfiles.ts` or a
  new `apiPublicProfiles.ts`) that queries the `public_profiles` view. Returns null
  for missing or private profiles.
- Add a `useGetPublicProfile(userId)` hook. Keep this entirely separate from the
  private `useGetUserProfile`.

### Step 4: Shared "Venues Added" list
- Build one reusable list of **approved** venues where `user_id = :targetUserId`,
  parameterised by user id (defaults to the logged-in user on the private profile).
- Reuse the favourites list's search/filter UX: `VenueListContainer` already wraps
  `SearchAndFilterPanel` + `VenueListView`. Likely needs a new mode (e.g. `'added'`)
  or a dedicated pagination/sort context mirroring `UserFavVenuesContext`, since the
  data source is "venues by author" rather than a list of favourite ids.
- **Replace URL-based mode detection.** `SearchAndFilterPanel`, `VenueListView`,
  `VenueListCard`, and `CitySelect` currently detect favourites/user mode via
  `useMatch('/profile/venues')`. The added-venues list and the public lists reuse
  these components at different URLs (`/profile/added-venues`, `/user/:userId`), so
  swap the hardcoded match for an explicit prop/context flag. Update the renamed
  `/profile/favourite-venues` slug (and the four `useMatch` call sites + the
  `navigate`/default in `UserProfile`) in the same slice.

### Step 5: Mount on the private profile
- Add a "Venues" (Added) tab to `UserProfile.tsx` alongside Reviews / Favourites /
  Notifications / Edit, rendering the Step 4 list for the logged-in user.

### Step 6: Public route + page shell
- Add `/user/:userId` route. Render a clear "profile not found / private" state when
  `getPublicProfile` returns null.

### Step 7: Read-only banner
- Make `UserProfileBanner`'s edit affordance optional (e.g. `onEditClick?`): when
  absent, do not render the settings cog. Reuse it on the public page.
- Add the join date line ("Member since June 2026").

### Step 8: Public contribution lists
- Mount the shared Venues Added list (Step 4) for the target user, plus a
  Reviews-left list — a variant of `ReviewContainer`/its query fetching **approved**
  reviews by the target `userId` rather than the logged-in user.

### Step 9: Conditional favourites list
- Only render when the target profile's `show_favourites` is true. Fetch the target
  user's favourites and show approved venues (reusing the favourites list UI).

### Step 10: Privacy settings
- Add a "Privacy" section to `EditProfilePanel` with two toggles: "Public profile"
  (default ON) and "Show my favourites on my profile" (default OFF). Add an update
  service + hook writing `is_public` / `show_favourites`.

### Step 11: Link attributions
- Point the "Added by" name in `DetailedVenueView` and review-author names to
  `/user/:userId`. When the target profile is private, render plain text (no link),
  preserving attribution without exposing a page.

### Step 12: Security pass
- Confirm the public path returns only whitelisted columns, returns not-found for
  private profiles, and that all listed content is approved-only. Add a test asserting
  no private fields (email, etc.) are present in the public profile response.

### Step 13: Tests
- Service + component coverage: public vs private, favourites opt-in on/off,
  approved-only filtering, not-found state, the read-only banner (no cog), and the
  shared Venues Added list on both profiles.

### Step 14: Privacy Policy
- Disclose that public profiles exist and what they show (username, avatar, counts,
  join date, contributions, and favourites when opted in). Confirm account deletion
  removes/anonymises the public profile. (See the privacy decision captured in the
  image-rights plan.)

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

_(Add a dated note here immediately after ticking each step in Current Status —
what changed, key files, and any decisions, mirroring the format in
`ADMIN_MODERATION_SPEC.md`.)_
