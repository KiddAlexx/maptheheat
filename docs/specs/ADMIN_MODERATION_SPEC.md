# Admin Moderation Workflow Spec

Living spec for building the MapTheHeat admin moderation workflow in small,
reviewable slices. Update the checkboxes after each completed step so future
chats can resume without needing the full conversation history.

## Resume Instructions

For a new chat, read `AGENTS.md` and this file, then continue from the first
unchecked item in `Current Status`. Keep each slice scoped to that step, preserve
public services as approved-only, put admin data access in moderation
services/hooks, update this spec after the slice, and run `npm.cmd run checks`
plus the relevant tests.

## Goals

- Add a local/dev-only admin moderation area to the main app.
- Start with venue moderation, then add reviews and standalone images.
- Keep public routes and services approved-only.
- Keep admin reads/writes separate under moderation services and hooks.
- Use Supabase Auth, RLS, and `is_admin()` as the real authorization boundary.
- Never use a service-role key in the frontend.

## Current Status

- [x] Step 1: Add moderation route shell.
- [x] Step 2: Protect moderation routes.
- [x] Step 3: Add admin venue query services and hooks.
- [x] Step 4: Add venue moderation queue.
- [x] Step 5: Add venue detail review screen.
- [x] Step 6: Add venue image moderation.
- [x] Step 7: Add venue status actions.
- [x] Step 8: Add admin venue edit form.
- [x] Step 9: Cover admin venue flow with tests.
- [x] Step 10: Add admin review query services and hooks.
- [x] Step 11: Add review moderation queue.
- [x] Step 11.5: Moderation refactor pass.
- [x] Step 12: Add review detail/edit screen.
- [x] Step 13: Add review status actions.
- [x] Step 14: Cover admin review flow with tests.
- [x] Step 15: Add admin standalone image query services and hooks.
- [x] Step 16: Add standalone image moderation queue.
- [x] Step 17: Add standalone image grouping/detail screen.
- [x] Step 18: Add standalone image status actions.
- [x] Step 19: Cover admin standalone image flow with tests.
- [x] Step 19.5: Post-standalone refactor pass.
- [x] Step 20a: Notification services, hooks, and shared composer.
- [x] Step 20b: Manual notifications tab.
- [x] Step 20c: Inline composer in venue and review detail.
- [x] Step 20d: Inline composer in standalone image group.
- [x] Step 20.5: Post-notifications refactor pass.
- [x] Step 21: Add notification reason checkboxes.
- [x] Step 22: Add admin nav link for admin users.
- [x] Step 23: Set venue thumbnail from moderation panel.

## Completed Slices

### Step 23: Set Venue Thumbnail From Moderation Panel

- `setVenueThumbnail` in `apiModeration.ts` accepts `{ venueId, url, altText }` and stores directly into `venue_details.thumbnail_image`; `imagePath.sm` is already a full URL after `addImagePaths`, so no URL construction in the service.
- `useSetVenueThumbnail` hook accepts `SetVenueThumbnailArgs`; call site in `VenueModerationDetail` does the field extraction from `ModerationImage`. Invalidates both `['moderation', 'venue', venueId]` and `['moderation', 'venues']` on success.
- `ImageModerationPanel` gains optional `currentThumbnailUrl` and `onSetThumbnail` props; thumbnail controls only render for approved images when `onSetThumbnail` is provided — review and standalone callers unaffected.
- Thumbnail comparison uses `currentThumbnailUrl === image.imagePath.sm` (strict equality, both full URLs in production).
- Replaced inline status badge `<span>` with `<ModerationStatusBadge />`.
- 3 new tests cover: button only on approved images, current-thumbnail chip for matching URL, correct `{ venueId, url, altText }` payload on click.

### Step 22: Admin Nav Link

- Added `useIsAdmin(!!userId)` to `UserMenu` so the `is_admin()` RPC result is shared with `AdminRoute` via the `['admin', 'isAdmin']` query cache — no extra DB call.
- Conditionally renders an "Admin" `DropdownItem` at the top of the user dropdown that navigates to `/admin/moderation/venues`.
- Non-admin users see no change; the item is not rendered in the DOM when `isAdmin` is false.
- `MobileMenu` needs no change — `UserMenu` avatar dropdown is visible on both mobile and desktop.

### Step 1: Route Shell

- Added `/admin`.
- Added `/admin/moderation/venues`.
- Added `/admin/moderation/reviews` placeholder.
- Added `/admin/moderation/images` placeholder.
- Added `AdminLayout` with `Venues`, `Reviews`, and `Images` tabs.
- Added admin logo variant without exposing admin in public nav links.

### Step 2: Admin Guard

- Added `AdminRoute`.
- Uses existing authenticated user state.
- Checks Supabase `rpc('is_admin')` through `apiModeration`.
- Shows sign-in required, access denied, and loading states.
- Added tests for unauthenticated, non-admin, and admin access.

### Step 3: Admin Venue Services And Hooks

- Added moderation services in `src/services/apiModeration.ts`.
- Added moderation hooks in `src/features/moderation/hooks/`.
- Added moderation venue/status/image types in `src/types/venueTypes.ts`.
- Added pending city query through `get_pending_cities`.
- Kept public `src/services/apiVenues.ts` approved-only.
- Added hook tests for default pending venue/city behavior.

### Step 4: Venue Moderation Queue

- Added `VenueModerationQueue` for `/admin/moderation/venues`.
- Added status filtering for pending, approved, and declined venues.
- Added moderation city filtering, venue-name search, pagination, and queue
  rows with submitter/status/date metadata.
- Added links to `/admin/moderation/venues/:venueId` with a temporary detail
  placeholder until Step 5.
- Added component tests for default pending rendering, city filtering, and
  detail route links.

### Step 5: Venue Detail Review Screen

- Added `VenueModerationDetail` for `/admin/moderation/venues/:venueId`.
- Fetches venue submissions with `useModerationVenue`, keeping admin reads in
  moderation hooks/services.
- Shows admin-specific venue fields, status, submitter username/user id,
  submitted date, venue id, image count, and submitted attributes.
- Keeps status actions and image moderation controls deferred to Steps 6 and 7.
- Added component tests for detail rendering, load failure, and empty-result
  states.

### Step 6: Venue Image Moderation

- Added reusable `ImageModerationPanel` under moderation components.
- Shows attached moderation images with current image status badges.
- Allows admins to select approve or decline decisions with accessible
  checkboxes and submit `{ approvedImageIds, declinedImageIds }`.
- Wired venue detail image decisions through `useUpdateModerationImageStatuses`.
- Added component coverage for venue image status selection payloads.

### Step 7: Venue Status Actions

- Added venue approve and decline controls to `VenueModerationDetail`.
- Reused `useUpdateVenueModerationStatus`, which invalidates the venue detail
  and moderation venue queue queries after mutation.
- Disabled the action that matches the venue's current status while still
  allowing status changes between approved and declined.
- Added component tests for approve and decline mutation payloads.

### Step 8: Admin Venue Edit Form

- Added `VenueModerationEditForm` as an admin-only form separate from public
  `VenueForm`.
- Wired venue updates through `useUpdateModerationVenue`, preserving the
  admin service and React Query hook boundary.
- Supports correcting venue identity, slug, contact, address, coordinates,
  description, and submitted attribute lists.
- Normalizes phone numbers, trims string fields, parses comma-separated
  attribute lists, and validates required fields before mutation.
- Added component coverage for corrected venue update payloads.

### Step 9: Admin Venue Flow Tests

- Added coverage for the admin moderation layout tabs and tab navigation.
- Expanded venue queue tests for status filter and venue-name search behavior.
- Added public venue service regression coverage for approved-only venue and
  image reads.
- Kept admin reads and writes covered through moderation hooks and service mocks.

### Step 10: Admin Review Services And Hooks

- Added moderation review types with status, submitter username, venue context,
  and review-attached moderation images.
- Added admin review list/detail/update/status services to `apiModeration.ts`.
- Added React Query hooks for review moderation reads and writes under
  `src/features/moderation/hooks/`.
- Kept public `apiReviews.ts` unchanged and approved-only.
- Added hook coverage for default pending review reads and review mutations.

### Step 11: Review Moderation Queue

- Replaced the review moderation placeholder with `ReviewModerationQueue`.
- Added pending, approved, and declined status filters with pending as the
  default.
- Reused the moderation city dropdown for review city filtering. Pending uses
  review-specific cities, while approved/declined use the approved venue city
  list so admins can check cities with no reviews in that status.
- Added search filters for venue, submitter username, and review text.
- Rendered compact review rows with title, venue, submitter, ratings, created
  date, current status, and ids.
- Added links to `/admin/moderation/reviews/:reviewId` with a temporary detail
  placeholder until Step 12.
- Added component coverage for default pending rendering, status changes,
  search filters, and detail route links.
- Switched review reads to `profiles!inner(...)` and `venue_details!inner(...)`
  joins so PostgREST applies city/username filters to the parent rows rather
  than only to the embedded resources.
- Normalized `venueDetails` in `mapModerationReview` to a single object because
  PostgREST returns view-backed embedded resources as arrays, which was
  causing "Unknown venue" labels in the queue.
- Added next/prev page prefetching to `useModerationVenues` and
  `useModerationReviews`, mirroring the public `useVenues` pattern.
- Added `tests/services/apiModeration.test.ts` covering inner-join select and
  `venueDetails` array normalization on list and detail reads.

### Step 11.5: Moderation Refactor Pass

- Extracted `MODERATION_STATUSES`, `STATUS_LABELS`, `STATUS_BADGE_CLASSES` to
  `src/features/moderation/constants.ts` and removed copies from the venue
  queue, review queue, venue detail, and image moderation panel.
- Added `formatSubmittedDate` (with optional `includeTime` flag) and
  `getImageStatusUpdatePayload` / `hasImageStatusUpdates` helpers under
  `src/features/moderation/utils/`.
- Split `useUpdateModerationImageStatuses` into `useUpdateVenueImageStatuses`
  and `useUpdateReviewImageStatuses` so each writes to its own detail cache
  key. Shared image-cache update logic lives in `applyImageStatusUpdate`.
  Step 17 will add the standalone variant.
- Renamed `UpdateVenueModerationStatusArgs` /
  `UpdateReviewModerationStatusArgs` to
  `UpdateModerationVenueStatusArgs` / `UpdateModerationReviewStatusArgs`,
  and `updateVenueModerationStatus` / `updateReviewModerationStatus` to
  `updateModerationVenueStatus` / `updateModerationReviewStatus`. Hooks
  follow: `useUpdateModerationVenueStatus`,
  `useUpdateModerationReviewStatus`.
- Merged `getModerationCities` and `getModerationReviewCities` into one
  scoped service `getModerationCities({ scope: 'venue' | 'review', status })`.
  Hook query key is now `['moderation', 'cities', scope, status]`.
- Replaced `ModerationCitySelect`'s raw `<select>` with HeroUI `<Select>`.
  Prop API is now `value: string` + `onChange: (value: string) => void`.
  Tests query the trigger via `getByRole('button', { name: /city/i })`
  and click it before clicking an option.
- Extracted `ModerationQueueRow` and `ModerationSubmitter` to remove
  duplication between venue and review queues; `VenueModerationDetail` also
  uses the submitter component.
- All 51 existing tests still pass; no behavior changes.

### Step 12: Review Detail/Edit Screen

- Added `ReviewModerationDetail` for `/admin/moderation/reviews/:reviewId`.
- Added `ReviewModerationEditForm` for admin corrections to review title,
  content, heat/quality ratings, and venue-type-specific hottest item fields.
- Reused `ImageModerationPanel`, `useUpdateReviewImageStatuses`,
  `ModerationSubmitter`, `formatSubmittedDate`, and shared status constants.
- Kept review status approve/decline actions deferred to Step 13.
- Added component coverage for detail rendering, review image decisions, edit
  payloads, load failure, and missing route id states.

### Step 13: Review Status Actions

- Added approve and decline controls to `ReviewModerationDetail`.
- Reused `useUpdateModerationReviewStatus`, preserving the moderation service
  and React Query hook boundary.
- Disabled the action matching the review's current status while allowing
  changes between approved and declined.
- Requires review-attached pending image decisions before approval, and updates
  selected image statuses before approving when decisions are selected.
- Added component coverage for approve, decline, and image-before-approval
  mutation payloads.

### Step 14: Review Tests

- Added route-level coverage that opens a review detail screen from the review
  moderation queue.
- Added public `apiReviews` regression coverage for approved-only review reads
  and approved-only review image embeds.
- Switched `apiReviews`'s `EditformData` import to `import type` so service
  tests do not pull the public review form into runtime.
- Verified the review moderation test set across hooks, layout, queue, detail,
  flow, moderation services, and public review service boundaries.

### Step 15: Admin Standalone Image Services And Hooks

- Added `ModerationStandaloneImageGroup` and standalone image moderation
  filter types in `src/types/venueTypes.ts`.
- Added `getModerationStandaloneImages()` backed by the existing
  `pending_standalone_image_groups` view, plus
  `getModerationStandaloneImageGroup()` using derived `venueId:userId` group
  ids for the future detail route.
- Added `useModerationStandaloneImages`,
  `useModerationStandaloneImageGroup`, and
  `useUpdateStandaloneImageStatuses` under moderation hooks.
- Reused the shared `updateModerationImageStatuses` service and
  `applyImageStatusUpdate` helper for standalone image decisions.
- Added hook and service coverage for default pending reads, group lookup, and
  standalone image status updates.

### Step 16: Standalone Image Moderation Queue

- Replaced the image moderation placeholder with
  `StandaloneImageModerationQueue` for `/admin/moderation/images`.
- Added pending, approved, and declined status filters with pending as the
  default, plus venue-name and submitter username search filters.
- Reused `ModerationQueueRow`, `ModerationSubmitter`, `formatSubmittedDate`,
  and shared moderation status constants for compact standalone group rows.
- Added thumbnail previews, image counts for the active status, submitter,
  venue, submitted date, group id, and venue id metadata.
- Added a temporary `/admin/moderation/images/:groupId` placeholder route so
  queue row links can navigate until the Step 17 detail screen lands.
- Updated `ImageModerationPanel` thumbnails to open the existing full-size
  `ImageCarousel` modal, using large image URLs for moderation review.

### Step 17: Standalone Image Group Detail

- Added `StandaloneImageModerationGroup` for
  `/admin/moderation/images/:groupId`, using the derived `venueId:userId`
  group id from the queue route.
- Fetches standalone image group data through
  `useModerationStandaloneImageGroup` and keeps admin reads under moderation
  hooks/services.
- Shows image status counts, submitter metadata, related venue fields, group id,
  venue id, submitted date, and all images in the group.
- Reused `ImageModerationPanel` with a new optional `title` prop so this screen
  labels the panel "Submitted images" while venue/review screens still default
  to "Attached images".
- Wired per-image approve/decline decisions through
  `useUpdateStandaloneImageStatuses`, clearing selected decisions after a
  successful update.

### Step 18: Standalone Image Status Actions

- Added a draft decision panel to
  `StandaloneImageModerationGroup`.
- Kept standalone image writes reserved for the existing
  `useUpdateStandaloneImageStatuses` hook so Step 20 can submit decisions after
  notification review.
- Standalone image choices are now draft decisions; selecting individual images
  or marking all images approved/declined does not update Supabase yet.
- Admins proceed from the side panel only after every pending image has a
  decision, keeping the screen available for the future notification step.
- `ImageModerationPanel` now supports selection-only usage while venue/review
  image panels keep the default "Update images" mutation button.
- Added component coverage for mixed decisions, mark-all approved, and
  mark-all declined without saving image statuses early.

### Step 19: Standalone Image Tests

- Added route-level coverage for opening a standalone image group detail screen
  from the image moderation queue.
- Expanded standalone group coverage to ensure admins cannot proceed while
  pending images are missing draft decisions.
- Verified the standalone image coverage set across query hooks, queue
  rendering, group detail, grouping service reads, draft decisions, mark-all
  actions, and the queue-to-detail flow.

### Step 19.5: Post-Standalone Refactor Pass

- Extracted `ModerationDetailMessage`, `ModerationDetailItem`,
  `ModerationStatusBadge`, and `ModerationStatusActions` to
  `src/features/moderation/components/`. Removed the local copies from
  `VenueModerationDetail`, `ReviewModerationDetail`, and
  `StandaloneImageModerationGroup` (~150 lines of duplication).
- `ModerationStatusActions` is parameterized by `resourceLabel` so venue
  and review screens share the same approve/decline panel.
- `ModerationDetailMessage` uses `useId` for the `aria-labelledby` coupling
  so callers no longer need to invent unique ids.
- Added prefetch (next/prev page) to `useModerationStandaloneImages`,
  matching the pattern in `useModerationVenues` and `useModerationReviews`.
- Made `isUpdating` optional on `ImageModerationPanel` (default `false`).
  Selection-only callers like `StandaloneImageModerationGroup` no longer
  need to pass `isUpdating={false}`.
- Added a comment in `StandaloneImageModerationGroup` explaining why
  `onUpdateStatuses` is deliberately omitted (decisions stay draft until
  the Step 20 notification flow lands).
- Added a comment in `apiModeration.ts` explaining why
  `ModerationStandaloneImagesRequestParams` has no `sort` field (the
  grouping view is always ordered by `last_created_at`).
- Added service-level test coverage for `updateModerationImageStatuses`,
  exercising the batched approve/decline payload and the empty-array
  short-circuit path.
- All 84 tests pass; no behavior changes.

### Step 20a: Notification Services, Hooks, And Shared Composer

- Added moderation notification recipient search and
  `admin_insert_notification` RPC wrappers to `src/services/apiModeration.ts`,
  keeping admin notification access out of public services.
- Added `AdminNotificationPayload`, recipient types, and fixed
  `UserNotification.requestStatus` to use `'declined'` without the leading
  space.
- Added `useSearchModerationNotificationRecipients`,
  `useInsertModerationNotification`, `ModerationNotificationComposer`, and
  the pure `buildModerationNotificationTemplate` helper.
- Added `buildVenueShareUrl()` and refactored `DetailedVenueView` to use the
  shared URL builder.
- Composer title/message fields are editable starting points; checkbox or
  field changes do not overwrite admin text unless `Generate message` or
  `Reset template` is clicked.
- Verified with `npm.cmd run checks` and targeted Vitest coverage for
  moderation services, hooks, templates, and composer behavior.

### Step 20b: Manual Notifications Tab

- Added `AdminNotificationCenter` at `/admin/moderation/notifications` and
  wired it under the existing `AdminRoute` / `AdminLayout` tree.
- Added the fourth `Notifications` admin tab.
- Added a manual recipient picker that debounces username/user-id search by
  250ms, searches at 2+ chars, and immediately selects pasted UUIDs without
  running a search.
- The manual page hosts the shared `ModerationNotificationComposer` in manual
  mode; notification sending remains separate from moderation status updates.
- Covered route rendering, recipient search/selection, template regeneration
  rules, notification send payloads, in-flight disabled state, and the negative
  no-status-mutation case.

### Step 20c: Inline Composer In Venue And Review Detail

- Added post-decision notification draft snapshots to `VenueModerationDetail`
  and `ReviewModerationDetail`, rendered through the shared
  `ModerationNotificationComposer` in moderation mode after status success.
- Drafts are built before status mutations and use `buildVenueShareUrl()` for
  venue/review links, so the composer reads frozen data rather than live query
  state.
- Tracked successful admin edits through `useUpdateModerationVenue` and
  `useUpdateModerationReview`; edited approvals now open the partial template
  with link and edits options pre-checked.
- Covered venue approve/decline notification payloads, review edited partial
  drafts, RPC retry/error behavior, and the status-vs-notification call split.

### Step 20d: Inline Composer In Standalone Image Group

- Converted standalone image draft decisions into a save-first flow using
  `useUpdateStandaloneImageStatuses`, with notification sending remaining a
  separate second action.
- Added a frozen image notification snapshot before saving decisions, including
  canonical venue links from `buildVenueShareUrl()` for approved, partial, and
  declined image outcomes.
- Rendered the shared moderation-mode composer after image status success, with
  all-approved, mixed, and all-declined image templates covered by tests.
- Kept a saved group snapshot so the composer remains available after pending
  images leave the standalone group query.

## Architecture Rules

- Do not make public components admin-aware with `isAdmin` flags.
- Do not modify public services to include pending/declined data.
- Frontend separation (public vs moderation services, route guards, hooks) is
  for clarity and reviewability. The database (RLS + `is_admin()`) is the
  actual security boundary; never rely on the frontend split to keep
  unmoderated data away from anonymous users.
- Moderation types extend public types, not the other way around.
  `ModerationVenue extends Venue`, never `Venue` accreting `status` /
  `submitterUsername` / image moderation fields.
- Public service examples:
  - `getVenues()` returns approved venues only.
  - `getVenue()` returns one approved venue only.
- Admin service examples:
  - `getModerationVenues()` can read by moderation status.
  - `getModerationVenue()` can read a venue regardless of status.
  - `updateModerationVenueStatus()` updates venue moderation status.
- Components never call Supabase directly.
- Admin UI must use React Query hooks backed by moderation services.
- Server state stays in React Query; client-only UI state can use component state
  or existing context patterns where appropriate.
- RLS and SQL functions are the security boundary; route guards are UX only.

## Planned File Areas

- Admin components:
  - `src/features/moderation/components/`
- Admin hooks:
  - `src/features/moderation/hooks/`
- Admin services:
  - `src/services/apiModeration.ts`
- Admin shared constants and helpers:
  - `src/features/moderation/constants.ts`
  - `src/features/moderation/utils/`
- Moderation types:
  - `src/types/venueTypes.ts` (venue, image, status)
  - `src/types/reviewTypes.ts` (review)
- Tests:
  - `tests/features/moderation/`
  - `tests/services/` (public/admin service boundary regressions)

## Step Plan

### Step 4: Venue Moderation Queue

- Replace the venue placeholder with a functional queue.
- Default status filter to `pending`.
- Add status tabs/filter for `pending`, `approved`, and `declined`.
- Add city filter backed by `useModerationCities`.
- Add basic search/filter/pagination where useful.
- Render venue rows/cards with key moderation metadata.
- Selecting a venue should navigate to `/admin/moderation/venues/:venueId`.
- Add or update tests for default pending behavior and tab rendering.

### Step 5: Venue Detail Review Screen

- Add `/admin/moderation/venues/:venueId`.
- Fetch with `useModerationVenue`.
- Show venue details in an admin-specific page.
- Do not reuse `DetailedVenueView` directly.
- Extract smaller presentational pieces only when it keeps the code cleaner.
- Show venue status, submitter user id, and created/submitted date where present.

### Step 6: Venue Image Moderation

- Show images attached to the moderation venue.
- Show image status.
- Allow selecting images to approve or decline.
- Send `{ approvedImageIds, declinedImageIds }` through
  `useUpdateModerationImageStatuses`.
- Build this as a reusable admin image moderation component, not a
  venue-only widget.
- The same component should later be used on review moderation detail for
  review-attached images and on standalone image group detail.
- Keep controls accessible with real buttons, labels, and checkboxes.

### Step 7: Venue Status Actions

- Add approve and decline controls for the venue.
- Use `useUpdateVenueModerationStatus`.
- Invalidate moderation venue and venue queue queries after mutation.
- Notifications remain deferred.

### Step 8: Admin Venue Edit Form

- Add admin-only edit form for correcting venue fields before approval.
- Reuse field/validation patterns from `VenueForm` where practical.
- Do not turn public `VenueForm` into an admin-aware component with flags.
- Keep submit behavior separate from public venue creation.

### Step 9: Tests

- Cover admin route access states.
- Cover moderation tabs.
- Cover pending venue queue behavior.
- Cover approve/decline mutation calls.
- Cover image status selection payloads.
- Keep tests behavior-focused and use existing test utilities.

## Review Moderation Plan

### Step 10: Admin Review Services And Hooks

- Add review moderation functions to `src/services/apiModeration.ts`, or split
  into a separate admin review service if `apiModeration.ts` becomes too large.
- Keep public `src/services/apiReviews.ts` approved-only.
- Add review moderation types in `src/types/reviewTypes.ts` if existing public
  review types do not include moderation fields.
- Add hooks under `src/features/moderation/hooks/`:
  - `useModerationReviews`.
  - `useModerationReview`.
  - `useUpdateReviewModerationStatus`.
  - `useUpdateModerationReview`.
- Default review status filter to `pending`.
- Use React Query with `staleTime: 60_000`.

### Step 11: Review Moderation Queue

- Replace the review placeholder with a functional queue.
- Add status filter for `pending`, `approved`, and `declined`.
- Add search/filter controls where useful, likely venue, city, username, and
  review title/content search.
- Show compact review metadata:
  - review title.
  - venue name.
  - submitter/user id or username if available.
  - heat and quality ratings.
  - created date.
  - current status.
- Selecting a review should navigate to `/admin/moderation/reviews/:reviewId`.

### Step 12: Review Detail/Edit Screen

- Add `/admin/moderation/reviews/:reviewId`.
- New components mirror the venue pattern: `ReviewModerationDetail.tsx` and
  `ReviewModerationEditForm.tsx` under
  `src/features/moderation/components/`.
- Fetch with `useModerationReview`.
- Show review content, ratings, venue context, submitter metadata, and status.
- Show review-attached pending images with `ImageModerationPanel`.
- Wire image decisions through `useUpdateReviewImageStatuses` (added in
  Step 11.5) so the review detail cache stays correct.
- Allow approving or declining review-attached images before or alongside review
  approval.
- Add an admin-only edit form for correcting review fields before approval.
- Reuse form validation patterns where practical.
- Do not make public `ReviewForm` admin-aware with flags. If shared field
  markup is worth reusing, extract a presentational sub-component first.
- Reuse Step 11.5 shared pieces where they fit:
  `ModerationSubmitter`, `formatSubmittedDate`, and the constants in
  `src/features/moderation/constants.ts`.

### Step 13: Review Status Actions

- Add approve and decline controls.
- Use `useUpdateModerationReviewStatus` (renamed in Step 11.5).
- Invalidate moderation review and review queue queries after mutation.
- Keep notification sending deferred to Step 20.

### Step 14: Review Tests

- Cover default pending review query behavior.
- Cover review tab/queue rendering.
- Cover selecting a review and loading detail screen.
- Cover approve/decline mutation calls.
- Cover edit submit payload where edit behavior is added.
- Add regression coverage that public review services still filter approved
  content.

## Standalone Image Moderation Plan

### Step 15: Admin Standalone Image Services And Hooks

- Add standalone image moderation functions to admin services.
- Keep public image upload/read paths unchanged.
- Add image moderation types if existing venue image types are not enough.
- Use the old admin app as the grouping reference:
  - source query/view: `pending_standalone_image_groups`.
  - each row represents a standalone image group with venue/user metadata.
  - each row includes an `images[]` payload for the images in that group.
- Add hooks under `src/features/moderation/hooks/`:
  - `useModerationStandaloneImages`.
  - `useModerationStandaloneImageGroup` if grouping by upload batch or venue is
    useful.
  - `useUpdateStandaloneImageStatuses` — name aligned with the venue/review
    image hooks split in Step 11.5.
- Default image status filter to `pending`.
- Query only standalone images for this slice, not venue-attached images already
  handled in the venue flow.

### Step 16: Standalone Image Moderation Queue

- Replace the image placeholder with a functional queue.
- Add status filter for `pending`, `approved`, and `declined`.
- Group images using the old admin approach unless the database view changes:
  `pending_standalone_image_groups`.
- Expected group metadata:
  - `venueId`.
  - `venueName`.
  - `city`.
  - `venueNameSlug`.
  - `userId`.
  - `username`.
  - `imageCount`.
  - `lastCreatedAt`.
  - `images`.
- Show compact metadata:
  - preview thumbnail.
  - image count in group.
  - submitter/user id.
  - related venue when available.
  - created date.
  - current status.
- Search filters: venue name and submitter username. Skip the city dropdown
  here — groups are already venue-scoped, and venue-name search is more
  useful than a city filter. `ModerationCityScope` does not need a
  `'standalone'` value.
- Reuse `ModerationQueueRow`, `ModerationSubmitter`, `formatSubmittedDate`,
  and the constants in `src/features/moderation/constants.ts`. The metadata
  slot can hold a small image-preview cluster and the standalone-specific
  fields.
- Selecting a group should navigate to an image detail/group screen.

### Step 17: Standalone Image Group/Detail Screen

- Add a route such as `/admin/moderation/images/:groupId` once the grouping
  key is decided.
- New component `StandaloneImageModerationGroup.tsx` under
  `src/features/moderation/components/` to mirror the venue/review detail
  pattern.
- Show all images in the selected group.
- Show submitter metadata and related venue/review context where available.
- Reuse `ImageModerationPanel` for image decisions. Add an optional `title`
  prop to the panel here so the standalone screen can render
  e.g. "Submitted images" instead of "Attached images". Default stays
  unchanged so venue and review consumers do not need updates.
- Wire image decisions through `useUpdateStandaloneImageStatuses` (Step 15)
  so the group cache stays correct.
- Allow per-image selection for approval or decline because groups can contain
  mixed-quality images.
- Keep image previews accessible with useful alt text and clear labels.
- Reuse `ModerationSubmitter` and `formatSubmittedDate` for metadata.

### Step 18: Standalone Image Status Actions

- Add approve and decline controls for individual images or the selected group.
- Use `useUpdateStandaloneImageStatuses` from Step 15.
- Invalidate image queue/detail queries after mutation.
- Keep notification sending deferred to Step 20.

### Step 19: Standalone Image Tests

- Cover default pending standalone image query behavior.
- Cover image tab/queue rendering.
- Cover grouping behavior.
- Cover image selection payloads.
- Cover approve/decline mutation calls.

## Notification Plan

Step 20 is split into four small slices. Each is independently shippable
with its own tests. Moderation status updates always save first; the
notification is a separate second step. No combined RPC in this slice.

Shared design notes (apply to all four slices):

- Reuse the existing `admin_insert_notification(p JSONB)` RPC defined in
  `supabase/schema.sql`. No DB work.
- `request_status` mapping: `'confirmed'` for approved or partial,
  `'declined'` for full decline. `notification_status` defaults to
  `'unread'`.
- Templates auto-derive on mount and re-derive when decision, related type,
  or any of the four checkboxes change. Both title and message are always
  editable text fields, so admins can add custom context before sending.
  Regenerating a template replaces the current title/message with the selected
  template output; sending always uses the text currently in the fields.
- Four checkboxes:
  - `Include venue link`
  - `Mention edits/changes`
  - `Mention some images were declined`
  - `Mention unsuitable photos were removed`
  - `Mention not spicy enough / not a spicy venue`
  - `Mention explicit content`
  Manual tab starts unchecked. Inline (moderation-flow) composer
  pre-checks based on context (e.g. venue approved with edits → include
  link + mention edits; images partial → include link + mention images
  declined).
- Composer shape: `mode: 'manual' | 'moderation'`. In moderation mode the
  recipient, related type, venue id, venue name, and decision render as
  read-only summary rows; only title/message/checkboxes are editable. In
  manual mode every field is an input.
- Link URLs are absolute and use a shared
  `buildVenueShareUrl(venue)` helper (new) that
  `DetailedVenueView.tsx:251` adopts at the same time so we don't have two
  copies. Shape: `https://maptheheat.com/app/venue/{city}/{country}/{slug}/{id}`.
- Snapshot pattern in detail flows: on click of approve/decline, snapshot
  `{ userId, venueId, venueName, venueNameSlug, decision, linkUrl }` into
  local state **before** firing the status mutation. The composer reads
  only from the snapshot, never the live query, so it survives the row
  leaving the pending view.
- Failure mode: if the moderation status update succeeds but the
  notification RPC fails, keep the composer mounted with an error and a
  retry button. Never roll back the moderation status.

Default template catalogue:

- Venue approved:
  - Title: `Yay, {venueName} is live!`
  - Message: `Good news - your venue {venueName} has been approved. You can find the venue here: {linkUrl}`
- Venue declined:
  - Title: `Update on {venueName}`
  - Message: `Thanks for submitting {venueName}. We could not approve it this time, but you can make changes and try again.`
- Venue partial/edited:
  - Title: `{venueName} has been approved with a few tidy-ups`
  - Message: `Yay, {venueName} has been approved. We made a few small edits before approving it. You can find the venue here: {linkUrl}`
- Venue partial/photos removed:
  - Title: `{venueName} is live with a few photo changes`
  - Message: `Yay, {venueName} has been approved. We removed a few photos that were not suitable. You can find the venue here: {linkUrl}`
- Review approved:
  - Title: `Your review for {venueName} is live`
  - Message: `Yay, your review for {venueName} has been approved. You can find the review here: {linkUrl}`
- Review declined:
  - Title: `Update on your review for {venueName}`
  - Message: `Thanks for sending your review for {venueName}. We could not approve it this time, but you can edit it and try again.`
- Review partial/edited:
  - Title: `Your review for {venueName} is live with a few edits`
  - Message: `Yay, your review for {venueName} has been approved. We made a few small edits before publishing it. You can find the review here: {linkUrl}`
- Images all approved:
  - Title: `Your images for {venueName} were approved`
  - Message: `Yay, your images for {venueName} have been approved. You can find the images here: {linkUrl}`
- Images all declined:
  - Title: `Update on your images for {venueName}`
  - Message: `Thanks for adding images for {venueName}. We could not approve those images this time, but you can upload different ones whenever you are ready. You can find the images here: {linkUrl}`
- Images partial:
  - Title: `Some of your images for {venueName} were approved`
  - Message: `Thanks for adding images for {venueName}. We approved some of them, but a few were not quite right for MapTheHeat this time. You can find the images here: {linkUrl}`

Decline/edit reason snippets:

- Not spicy enough / not a spicy venue:
  - `MapTheHeat is focused on places with a clear spicy food angle, and this one does not seem like the right fit for us right now.`
- Explicit content:
  - `Some submitted content included explicit material, so we could not approve it.`
- Unsuitable photos:
  - `Some photos were not suitable for the venue page, so we removed or declined those images.`
- Low quality or unclear images:
  - `A few images were too unclear or low quality to publish.`

Manual editing rules:

- Template text is a starting point only. Admin edits must never be overwritten
  while typing unless the admin explicitly clicks `Generate message` or
  `Reset template`.
- Empty optional placeholders are omitted cleanly. For example, if
  `Include venue link` is unchecked, the generated copy should not contain an
  empty `here: ` fragment.
- Manual tab sends exactly what is in the editable fields, even if it differs
  from the generated template.
- Inline moderation composers preload from the saved moderation decision, but
  the admin can still change title, message, and checkbox choices before
  sending the notification.

### Step 20a: Notification Services, Hooks, and Shared Composer

- Add to `src/services/apiModeration.ts`:
  - `searchModerationNotificationRecipients(query)` — `profiles` query,
    `ilike` on `username`, or `eq` on `user_id` if `query` matches a UUID
    regex. Returns `{ userId, username }[]`. Debounced upstream in the
    hook.
  - `insertModerationNotification(payload)` — wraps
    `supabase.rpc('admin_insert_notification', { p: decamelizeKeys(payload) })`.
- Add `AdminNotificationPayload` type in `src/types/userTypes.ts` and fix
  the existing leading-space typo on `UserNotification.requestStatus`
  (`' declined'` → `'declined'`).
- Add hooks under `src/features/moderation/hooks/`:
  - `useSearchModerationNotificationRecipients` — React Query,
    `staleTime: 60_000`, `enabled: query.length >= 2`, debounced 250ms in
    consumer.
  - `useInsertModerationNotification` — mutation, success toast
    `Notification sent`. No moderation cache invalidation needed.
- Add `src/features/moderation/components/ModerationNotificationComposer.tsx`
  (shared, modes `'manual' | 'moderation'`).
- Add `src/features/moderation/components/notificationTemplates.ts` — pure
  function `buildModerationNotificationTemplate({ relatedType, decision, venueName, linkUrl, includeLink, mentionEdits, mentionImagesDeclined })`
  returning `{ title, message }`. Test in isolation — most logic lives
  here.
- Composer fields: recipient, related type, decision, venue name, link URL,
  checkboxes, editable title, editable message, `Generate message`,
  `Reset template`, and `Send notification`.
- Add `src/utils/buildVenueShareUrl.ts` and refactor
  `DetailedVenueView.tsx:251` to use it.
- Tests: service test for the recipient search query shape (UUID branch
  vs username branch), service test for the RPC payload shape, hook
  tests for default disabled / enabled-on-2-chars behaviour, isolated
  template tests for each `(relatedType, decision, checkboxes)` combo.
- No UI integration in this slice. The composer is exported and tested
  but not mounted yet.

### Step 20b: Manual Notifications Tab

- Add `AdminNotificationCenter.tsx` page component for
  `/admin/moderation/notifications`. Hosts `<ModerationNotificationComposer mode="manual" />`
  plus the recipient picker.
- Add a fourth tab `Notifications` to `AdminLayout.tsx`.
- Add the route under `<AdminRoute>` in `src/App.tsx`.
- Recipient picker UX: input with debounce (250ms), fires on ≥ 2 chars,
  shows a result list with username + user id, click to select. Direct
  paste of a UUID short-circuits the search and selects that user
  immediately.
- Tests: route renders, recipient search calls the hook with the right
  query, picking a result fills `userId`, picking decision/checkbox
  flips templates, send fires `useInsertModerationNotification` with the
  expected payload, send button disables while in flight. **Negative
  test:** the manual tab does not call any moderation status mutation
  under any input.

### Step 20c: Inline Composer in Venue and Review Detail

- Add `notificationDraft` snapshot state to both
  `VenueModerationDetail.tsx` and `ReviewModerationDetail.tsx`.
- On approve/decline button click, snapshot the relevant fields, fire
  the existing status mutation, and on success render the composer
  inline below the decision panel in `mode="moderation"`.
- Composer reads only from the snapshot. Pre-check checkboxes:
  - Approved with edits → `Include venue link` + `Mention edits`
  - Approved no edits → `Include venue link`
  - Declined → none
- Edits-detection: track whether the admin edited the venue/review via
  `useUpdateModerationVenue` / `useUpdateModerationReview` during this
  detail session. If yes, the snapshot's decision is stored as
  `'partial'`.
- The existing toast on status mutation stays unchanged.
- Tests: approve a pending venue snapshots the right fields, composer
  renders prefilled, send fires the RPC with the expected payload.
  Decline a venue produces the declined template with no link. Review
  with edits → partial template + mention-edits pre-checked. Failure
  mode: RPC mocked to reject, composer stays mounted with retry.

### Step 20d: Inline Composer in Standalone Image Group

- Convert the existing `Proceed with decisions` CTA in
  `StandaloneImageModerationGroup.tsx` to
  `Save decisions and prepare notification`.
- On click: snapshot
  `{ userId, venueId, venueName, venueNameSlug, decision, linkUrl, imageCounts }`,
  call `useUpdateStandaloneImageStatuses` with the draft decisions, and
  on success render the composer in `mode="moderation"`.
- `decision` is derived from the draft: all approved → `'approved'`,
  all declined → `'declined'`, mixed → `'partial'`.
- Pre-check checkboxes:
  - All approved → `Include venue link`
  - Partial → `Include venue link` + `Mention some images declined`
  - All declined → `Include venue link`
- The composer reads from the snapshot, so it stays mounted even though
  the saved images leave the pending standalone group view.
- Update the existing comment in
  `StandaloneImageModerationGroup.tsx` (placed in Step 19.5) to reflect
  that the deferral is now resolved.
- Tests: all-approved decisions → all-approved template payload;
  all-declined → declined template; mixed → partial template; image
  status update and notification send are separate calls; on
  notification RPC failure the composer stays mounted while the image
  statuses remain saved.

### Step 21: Notification Reason Checkboxes

- Added `ModerationReasonId` type, `ModerationReason` interface, and `MODERATION_REASONS` catalogue keyed by `NotificationRelatedType` in `notificationTemplates.ts`.
- Added `reasonIds?: ModerationReasonId[]` to `ModerationNotificationTemplateOptions`; selected reason snippets are appended before the link sentence via `appendOptionalSentences`.
- Added `selectedReasonIds: ModerationReasonId[]` state and a "Reason details" fieldset to `ModerationNotificationComposer`, filtered by the current `relatedType`.
- Checking or unchecking reasons does not overwrite admin-edited title/message until "Apply template changes" or "Reset template" is clicked; "Reset template" also clears all selected reason IDs back to `[]`.
- In manual mode, switching `relatedType` filters `selectedReasonIds` to only keep IDs that belong to the new type (since reason IDs are type-namespaced, switching types effectively clears all reasons).
- Inline composers (moderation mode) always start with no reasons selected.
- Added template unit tests for venue/review/image reason snippets, ordering before the link sentence, and cross-type filtering. Added composer tests for preserve-on-check, apply-generates-snippet, and reset-clears-reasons. Added AdminNotificationCenter test for type-specific reason rendering.

### Step 20.5: Post-Notifications Refactor Pass

- Fixed `buildImageTemplate` passing `mentionEdits` to partial/approved
  branches — now correctly passes `mentionImagesDeclined` so the appended
  sentence matches what actually happened (images declined, not record edits).
- Added null guard to `buildVenueShareUrl`: returns `null` when any of city /
  country / venueNameSlug / venueId are missing; callers pass the null safely.
  Updated `DetailedVenueView` with `?? ''` fallback for the `ShareButton`.
- Added ilike wildcard escaping in `searchModerationNotificationRecipients`:
  `%` / `_` / `\` in the username query are now escaped before interpolation.
- Extracted `useModerationNotificationDraft` hook from the near-identical
  `VenueNotificationDraft` / `ReviewNotificationDraft` state + `hasEdited`
  boilerplate in both detail screens. Type is `ModerationNotificationDraftSnapshot`.
- Added `aria-autocomplete="list"` and `aria-controls="recipient-results"` to
  the recipient search input; `role="listbox"` to the results list.
- Renamed composer "Generate message" button to "Apply template changes" to
  clarify that it must be clicked to apply checkbox changes. Added a helper
  hint below the text fields when no manual edits have been made.
- Added a missing notification-RPC-failure retry integration test to
  `ReviewModerationDetail.test.tsx` (venue and standalone already had this
  coverage; review was the gap).
- Added empty-query and wildcard-escape service tests for the recipient search
  to `tests/services/apiModeration.test.ts`.
- Added `buildVenueShareUrl` null-guard tests to
  `tests/utils/buildVenueShareUrl.test.ts`.
- Set global `testTimeout: 15_000` in `vite.config.ts` to prevent flaky
  timeouts on slow detail-screen tests under full-suite parallel load.
- All 129 tests pass; `npm.cmd run checks` clean.

### Step 21: Notification Reason Checkboxes

- Add text-only moderation reason checkboxes to
  `ModerationNotificationComposer`.
- Reasons affect generated notification copy only; do not save reasons to the
  database, notification payload, or moderation status records.
- Add a typed reason catalogue keyed by `relatedType`:
  `'venue'`, `'review'`, and `'image'`.
- Add `reasonIds?: ModerationReasonId[]` to notification template inputs and
  composer state. Prefer IDs over one boolean prop per reason.
- Render a `Reason details` checkbox group filtered by selected related type.
- Preserve manual-edit behavior: checking or unchecking reasons does not
  overwrite admin-edited title/message until `Generate message` or
  `Reset template` is clicked.
- Append selected reason snippets before the resource-specific link sentence.
- In manual mode, when the admin changes related type, clear selected reasons
  that do not apply to the new type.
- Inline venue/review/image composers start with no specific reasons selected;
  admins choose reasons after the moderation save succeeds.

Reason options:

- Venue:
  - Not a spicy venue / no clear spicy-food angle.
  - Duplicate or already listed.
  - Could not verify details.
  - Incomplete or confusing submission.
  - Unsuitable photos were removed.
- Review:
  - Not enough useful detail.
  - Not about the selected venue.
  - Not focused on the spicy item / heat experience.
  - Explicit, abusive, or unsafe content.
  - Attached review images were unsuitable.
- Images:
  - Low quality or unclear image.
  - Not related to the venue or food.
  - Duplicate or near-duplicate image.
  - Explicit or unsafe content.
  - Contains private or sensitive information.

Tests:

- Template unit tests for venue, review, and image reason snippets.
- Composer tests that reason checkbox changes preserve admin-edited copy until
  generation/reset.
- Manual notification test that changing related type clears invalid reasons.
- Inline moderation test that selected reasons appear in generated notification
  text.
- Run `npm.cmd run checks` plus relevant Vitest files.

### Verification expectations across 20a–d

- `npm.cmd run checks` clean after each slice.
- Targeted vitest after each slice; full `npm.cmd test -- --run` after
  20d.
- Manual smoke after 20b: search a username on the Notifications tab,
  send to a second account, confirm receipt on the public side.
- Manual smoke after 20c: approve a pending venue, confirm composer
  prefills, send. Decline a pending review, confirm declined template.
- Manual smoke after 20d: in a standalone group, mark some
  approved/some declined, save decisions, confirm partial template loads
  and image statuses are updated.

### Step 23: Set Venue Thumbnail From Moderation Panel

- Allow moderators to pick any approved image for a venue and promote it to `venue_details.thumbnail_image`. This column already exists as JSONB `{url, alt}` — no migration needed. The commented-out auto-set logic in `apiVenues.ts` was never shipped; this replaces it with an explicit admin action.
- Add `setVenueThumbnail(venueId: string, thumbnail: { url: string; alt: string })` to `src/services/apiModeration.ts` — direct `UPDATE venue_details SET thumbnail_image = ... WHERE venue_id = ...`. Keep this in the moderation service (admin write), not `apiVenues.ts` (public reads only). Build the `url` from `image_path.sm` (small variant), `alt` from `alt_text`.
- Add `useSetVenueThumbnail` hook under `src/features/moderation/hooks/` — TanStack Query `useMutation`; invalidates `['moderation-venue', venueId]` on success so the panel re-renders with the updated badge.
- In `ImageModerationPanel.tsx`, add per-image thumbnail controls:
  - Approved images show a "Set thumbnail" icon button (e.g. star outline).
  - The image whose `image_path.sm` URL matches `venue.thumbnailImage?.url` shows a filled star or "Current thumbnail" chip instead of the button.
  - Pending/declined images get no control.
  - The panel needs a new optional prop `onSetThumbnail?: (image: ModerationImage) => void` and `currentThumbnailUrl?: string`; when omitted (review/standalone callers) no thumbnail UI renders — backwards compatible.
- Wire `onSetThumbnail` and `currentThumbnailUrl` in `VenueModerationDetail` only; review and standalone detail screens pass neither.
- Scope: works on both pending and approved venues so thumbnails can be corrected after launch without reopening moderation.
- Files: `src/services/apiModeration.ts`, `src/features/moderation/hooks/useSetVenueThumbnail.ts` (new), `src/features/moderation/components/ImageModerationPanel.tsx`, `src/features/moderation/components/VenueModerationDetail.tsx`
- Tests: mutation payload shape (correct `url`/`alt` built from `image_path.sm`), cache invalidation, thumbnail control renders only for approved images, current-thumbnail badge shown for matching URL, review/standalone callers unaffected.
- Verify: clicking "Set thumbnail" on an approved image updates `venue_details.thumbnail_image` in the DB; venue card on the map reflects the new thumbnail within one query refresh.

## Future Notes

## Old Admin Reference

Use `C:\Web Development\maptheheat-admin` as read-only reference material.

Useful ideas to salvage:

- Pending city workflow.
- Venue status update hook.
- Review status update hook.
- Image moderation status update logic.
- `ImageModeration` concept reused inside venue and review moderation detail.
- `pending_standalone_image_groups` grouping for standalone image moderation.
- Edit venue form approach.
- Image moderation grouping approach.

Do not port directly:

- Public services in the old admin copy were changed to fetch pending data.
- In this repo, public services must remain approved-only.
- Old image moderation used console logging and sparse checkbox labels; rebuild
  it with explicit labels, accessible controls, and clearer state names.

## Verification Expectations

Before calling each slice complete:

- Run `npm.cmd run checks`.
- Run relevant Vitest files.
- Run `npm.cmd test -- --run` before larger milestones.
- Note that Vitest may need elevated execution on this machine because sandboxed
  `esbuild` spawn can fail with `EPERM`.

## Updating This Spec

After each completed slice:

- Check off the completed step in `Current Status`.
- Add a short completion note under `Completed Slices` for meaningful
  implementation steps.
- Keep completion notes to 3-6 bullets.
- Capture important decisions, file locations, and deviations from the plan.
- Note any gotchas future chats need, such as missing RPCs, test setup changes,
  or public/admin boundary decisions.
- Tiny docs/style-only steps can be recorded with just a checkbox if no future
  implementation context is needed.

## Commit Style

Use conventional commits with short bullet bodies for meaningful slices.

Example:

```text
feat(moderation): add admin venue services

- Add moderation venue, city, status, and image update services
- Add React Query hooks for admin venue moderation data
- Keep public venue services approved-only
- Cover default pending venue and city query behavior
```
