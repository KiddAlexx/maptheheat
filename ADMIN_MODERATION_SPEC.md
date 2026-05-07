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
- [ ] Step 9: Cover admin venue flow with tests.
- [ ] Step 10: Add admin review query services and hooks.
- [ ] Step 11: Add review moderation queue.
- [ ] Step 12: Add review detail/edit screen.
- [ ] Step 13: Add review status actions.
- [ ] Step 14: Cover admin review flow with tests.
- [ ] Step 15: Add admin standalone image query services and hooks.
- [ ] Step 16: Add standalone image moderation queue.
- [ ] Step 17: Add standalone image grouping/detail screen.
- [ ] Step 18: Add standalone image status actions.
- [ ] Step 19: Cover admin standalone image flow with tests.
- [ ] Step 20: Add notification workflow after approve/decline.

## Completed Slices

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

## Architecture Rules

- Do not make public components admin-aware with `isAdmin` flags.
- Do not modify public services to include pending/declined data.
- Public service examples:
  - `getVenues()` returns approved venues only.
  - `getVenue()` returns one approved venue only.
- Admin service examples:
  - `getModerationVenues()` can read by moderation status.
  - `getModerationVenue()` can read a venue regardless of status.
  - `updateVenueModerationStatus()` updates venue moderation status.
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
- Shared venue types:
  - `src/types/venueTypes.ts`
- Tests:
  - `tests/features/moderation/`

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
- Fetch with `useModerationReview`.
- Show review content, ratings, venue context, submitter metadata, and status.
- Show review-attached pending images with the shared admin image moderation
  component.
- Allow approving or declining review-attached images before or alongside review
  approval.
- Add an admin-only edit form for correcting review fields before approval.
- Reuse form validation patterns where practical.
- Do not make public `ReviewForm` admin-aware with flags unless extracting a
  smaller shared field component first.

### Step 13: Review Status Actions

- Add approve and decline controls.
- Use `useUpdateReviewModerationStatus`.
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
  - `useUpdateStandaloneImageModerationStatus`.
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
- Selecting a group should navigate to an image detail/group screen.

### Step 17: Standalone Image Group/Detail Screen

- Add a route such as `/admin/moderation/images/:groupId` once the grouping
  key is decided.
- Show all images in the selected group.
- Show submitter metadata and related venue/review context where available.
- Reuse the shared admin image moderation component from the venue/review flows.
- Allow per-image selection for approval or decline because groups can contain
  mixed-quality images.
- Keep image previews accessible with useful alt text and clear labels.

### Step 18: Standalone Image Status Actions

- Add approve and decline controls for individual images or the selected group.
- Use the standalone image status mutation hook.
- Invalidate image queue/detail queries after mutation.
- Keep notification sending deferred to Step 20.

### Step 19: Standalone Image Tests

- Cover default pending standalone image query behavior.
- Cover image tab/queue rendering.
- Cover grouping behavior.
- Cover image selection payloads.
- Cover approve/decline mutation calls.

## Notification Plan

### Step 20: Moderation Notifications

- Add notification workflow after venue, review, and image moderation basics are
  stable.
- After approve/decline, allow admin to send or update a notification to the
  submitting user.
- Use existing `user_notifications` table and admin notification RPCs:
  - `admin_insert_notification`.
  - `admin_update_notification`.
  - `admin_delete_notification` if needed.
- Prefer a single RPC for combined moderation status update plus notification
  if consistency becomes important.
- Add tests for notification payload creation and mutation calls.

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
