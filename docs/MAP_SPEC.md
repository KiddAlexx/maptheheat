# Map Venue Popup Spec

Living spec for the completed one-shot venue popup behavior.

## Goal

Open a venue's Leaflet popup when navigation explicitly asks the map to do so:
desktop list selection while the map is active, or the detail view back-to-map
button. After that initial open, Leaflet owns popup state. Closing the popup,
clicking the map, or opening a different pin should not be overridden by URL
params or rerenders.

## Final Behavior

- Desktop list click while on a map route: navigates to the selected map route,
  smoothly flies to the venue with the popup card visually centered, and opens
  the matching popup once.
- Desktop list click while on a venue route: keeps the right pane on
  `DetailedVenueView` and navigates to the clicked venue's detail route.
- Mobile list card click: opens `DetailedVenueView`.
- Detail view back-to-map icon: navigates to the selected map route with
  `pane=map`, coords, and one-shot popup state.
- Mobile map/list toggle: only switches pane or routes to the map; it does not
  request popup opening because no venue is selected in that flow.
- Manual map interactions stay local: clicking another pin opens that pin, and
  marker clicks do not update the URL.

## Key Design Decisions

- `location.state.openPopupFor` carries the one-shot popup-open intent. This
  avoids query-string pollution and avoids adding a client Context/store.
- `location.key` is tracked as consumed so rerenders, refetches, resize events,
  and marker ref timing do not reopen a popup the user already closed.
- `useParamsAndNavigate` owns map navigation details when a full `Venue` object
  is available: `pane=map`, `lat`/`lon`, and popup navigation state.
- `AppLayout` does not pass popup state for the mobile toggle.
- `MapView` opens from both the marker ref callback and an effect. This handles
  real `react-leaflet` timing where marker refs can arrive after parent effects.
- `ChangeCenter` uses `flyTo` (not `setView`) for a smooth animated pan.
  The target center is offset 150px north in pixel space at the flyTo zoom so
  the pin sits in the lower portion of the viewport and the popup card lands
  roughly centered. `<Popup autoPan={false}>` prevents a second Leaflet-driven
  pan from fighting the `flyTo` position.
- `VenueListView` desktop card clicks call `setParamsAndNavigate(venue)` with no
  explicit mode, letting `useParamsAndNavigate`'s `isOnMapRoute` check decide.
  This avoids a regression where an explicit `'map'` override would have
  navigated to the map route from non-app contexts (e.g. `/profile/venues`).

## Completed Work

- [x] Updated `useParamsAndNavigate` to add `pane=map`, coords, and
      `{ state: { openPopupFor: venueId } }` for map navigations.
- [x] Updated `VenueListView` so desktop list clicks respect the active right
      pane: map route opens popup, venue route stays in detail view.
- [x] Updated `MapView` with marker refs, stale-ref cleanup, one-shot
      `location.key` consumption, and delayed `openPopup()`.
- [x] Updated `DetailedVenueView` to use `setParamsAndNavigate(venue, 'map')`
      for the icon-only back-to-map button.
- [x] Removed popup state from the `AppLayout` mobile toggle route transition.
- [x] Added regression coverage for selected marker popup opening, consumed
      popup requests, and detail back-to-map navigation state.
- [x] Fixed `VenueListView` desktop card click to use no explicit mode override,
      preventing a profile-route regression.
- [x] Replaced `map.setView` with `map.flyTo` in `ChangeCenter` for smooth
      animation; added 150px north pixel offset so the popup card is visually
      centered rather than the pin; added `autoPan={false}` to `<Popup>`.

## Verification

Passed:

```bash
npm.cmd test -- tests/features/map/MapView.test.tsx tests/features/venues/components/DetailedVenueView.test.tsx --run --reporter verbose
npm.cmd run checks
```

Test output includes React Router future-flag warnings only.

---

## Developer Workflow Notes

This feature is intentionally split into two kinds of state:

- **URL route/query state** says which app view should be shown and where the
  map should center.
- **React Router navigation state** says whether this particular navigation
  event should open a popup once.

That split is the core idea. The selected venue can appear in the URL, but the
popup is not controlled by the URL forever. Once the popup has opened, Leaflet
owns it. This lets users close the popup, click another pin, or pan around the
map without React immediately reopening the previous popup.

### Main Data Flow

1. A component asks to navigate with a `Venue` object.
2. `useParamsAndNavigate` decides whether the target route is `map` or `venue`.
3. For map navigations, the helper adds:
   - `pane=map` so mobile layout shows the map pane.
   - `lat` and `lon` so `MapView` can fly to the selected venue.
   - `location.state.openPopupFor = venueId` so `MapView` knows which marker to
     open once.
4. `MapView` reads `location.state.openPopupFor`.
5. `MapView` stores Leaflet marker instances in `markerRefs`, keyed by
   `venueId`.
6. When the requested marker exists, `MapView` opens its popup once and records
   the current `location.key` in `consumedLocationKey`.
7. Future renders with the same `location.key` do nothing, so the user can close
   the popup without React reopening it.

### Why `location.state.openPopupFor`

The popup-open request is not placed in the query string because it is temporary
UI intent, not durable URL state. A URL like `/app/map/...?...&popup=venue-2`
would imply that refreshing or sharing the URL should keep controlling the
popup. That is not the desired behavior.

React Router `location.state` is a better fit because it is attached to one
navigation event. It lets list/detail actions say "open this popup now" without
making marker clicks, popup close state, or browser history more complicated.

### Why `location.key`

`location.key` is unique for each navigation entry. `MapView` uses it as the
"already handled this popup-open request" token.

This matters because the map can rerender for many reasons:

- React Query returns venue data.
- Marker refs mount after parent effects.
- Filters or pagination change the venue array.
- The mobile pane becomes visible and `ResizeObserver` invalidates the map.
- React rerenders during normal app state updates.

Without consuming the `location.key`, any of those renders could reopen a popup
after the user had closed it. With `location.key`, the popup opens once for that
navigation and then gets out of the user's way.

### Why Marker Refs Are Needed

`react-leaflet` popups are imperative at the marker level: the app needs the
actual Leaflet marker instance to call `marker.openPopup()`.

`MapView` stores those instances in:

```ts
const markerRefs = useRef<Record<string, L.Marker>>({});
```

Each `<Marker>` sets or clears its entry:

- On mount/update: `markerRefs.current[venue.venueId] = marker`
- On unmount: `delete markerRefs.current[venue.venueId]`

Deleting stale refs matters when filters, city changes, or refetches remove
markers. Otherwise the app could try opening a popup on an old marker instance.

### Why Popup Opening Happens In Two Places

`MapView` attempts to open the popup from:

- an effect that runs when venues/location state change
- the marker ref callback

This is deliberate. In real `react-leaflet` timing, the parent effect can run
before the marker ref exists. Trying from the ref callback covers that case.
Trying from the effect covers the normal data-arrival case. `consumedLocationKey`
prevents a double-open.

The actual `openPopup()` call is wrapped in `requestAnimationFrame` so the marker
has a frame to finish mounting before Leaflet opens the popup.

### How Centering Works

`MapView` uses `lat` and `lon` query params for the target venue. `ChangeCenter`
then calls `map.flyTo(...)` instead of `map.setView(...)` so the movement feels
intentional rather than snapping.

The map does not fly directly to the pin. It projects the pin into pixel space,
subtracts 150 pixels on the Y axis, and unprojects the result back into map
coordinates. That shifts the map center north so the marker sits lower in the
viewport and the popup card appears closer to the visual center.

`<Popup autoPan={false}>` is important. Leaflet normally pans again when opening
a popup. With the custom offset fly-to behavior, that second pan would fight the
positioning we already calculated.

### Route Behavior By Entry Point

Desktop list card while on `/app/map/...`:

- `VenueListView` calls `setParamsAndNavigate(venue)` with no explicit mode.
- `useParamsAndNavigate` sees `isOnMapRoute` and chooses `map`.
- The URL becomes `/app/map/...?...`.
- `location.state.openPopupFor` is set.
- `MapView` flies to the venue and opens the popup once.

Desktop list card while on `/app/venue/...`:

- `VenueListView` still calls `setParamsAndNavigate(venue)` with no explicit
  mode.
- `useParamsAndNavigate` sees it is not on the map route and chooses `venue`.
- The detail pane stays a detail pane and loads the clicked venue.

Mobile list card:

- `VenueListView` explicitly calls `setParamsAndNavigate(venue, 'venue')`.
- The user goes to the detail view.

Detail view back-to-map icon:

- `DetailedVenueView` calls `setParamsAndNavigate(venue, 'map')`.
- This explicitly requests the map route, `pane=map`, coords, and
  `openPopupFor`.
- `MapView` opens the popup once after the map and marker are ready.

Mobile map/list toggle:

- `AppLayout` only changes panes/routes.
- It does not pass `openPopupFor`, because this toggle is not a venue selection
  action in the final UX.

Manual marker click:

- Leaflet opens the clicked marker popup.
- The URL is unchanged.
- React does not synchronize this back into route state.

### Adding A New Popup-Opening Trigger

Use this checklist when adding a new UI action that should open a venue popup:

1. Make sure the action has a full `Venue` object.
2. Call `setParamsAndNavigate(venue, 'map')`.
3. Do not add a query param for popup state.
4. Do not add Context for the selected venue.
5. Add a regression test if the trigger is user-facing.

If the action only has route params and not a `Venue` object, prefer fetching or
passing the full `Venue` through the existing data flow. Only build the map URL
manually if the route component genuinely cannot access the venue object, as in
`AppLayout`.

### Common Pitfalls

- Do not make `venueId` route params continuously control the popup. That would
  reopen popups after users close them.
- Do not update the URL when a user clicks a map pin. Marker clicks are local
  map interactions, not app navigation.
- Do not put selected venue server data in Context. This project keeps server
  state in React Query and UI-only state in Context.
- Do not remove `autoPan={false}` without rechecking popup positioning.
- Do not remove stale marker ref cleanup; filters and refetches can unmount
  markers.
- Do not force `'map'` mode from generic list cards unless the current UX really
  wants the map. The helper's default route-based mode is what keeps profile and
  detail-route behavior correct.
