# VenueRating Component

**File:** `src/features/venues/components/VenueRating.tsx`

A custom SVG rating component supporting half-step precision (0.5–5), two icon variants, interactive and read-only modes, mouse hover, touch/swipe, and full keyboard accessibility.

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `initialRating` | `number \| null` | `0` | The current rating value to display |
| `readonly` | `boolean` | `false` | If true, renders a static display — no interactions |
| `handleRatingChange` | `(rating: number) => void` | — | Called when the user selects a new rating |
| `size` | `string` | `'24'` | Icon size in pixels (width and height of each icon) |
| `variant` | `'flame' \| 'star'` | `'flame'` | Which icon set to use |
| `name` | `string` | auto-generated | Radio group name — set this when multiple instances appear on the same page to keep their inputs independent |
| `ariaLabel` | `string` | `'Rating'` | Accessible label for the fieldset legend |

---

## Usage

```tsx
// Interactive — user can select a rating
<VenueRating
  initialRating={heatRating}
  handleRatingChange={setHeatRating}
/>

// Interactive with star variant
<VenueRating
  initialRating={qualityRating}
  handleRatingChange={setQualityRating}
  variant="star"
/>

// Read-only display (e.g. on a venue card)
<VenueRating
  initialRating={averageHeatRating}
  readonly
  size="20"
/>
```

---

## How the visual fill works

The rating display is built from three stacked layers inside a fixed-size container:

```
┌─────────────────────────────────────┐  ← container (width = iconSize × 5)
│ [background layer]  grey icons      │  absolute, full width, pointer-events-none
│ [foreground layer]  coloured icons  │  absolute, width = fillPct%, overflow:hidden
│ [interactive labels] (interactive)  │  flow normally on top of both layers
└─────────────────────────────────────┘
```

**Background layer** — five icons rendered in the inactive colour, covers the full width.

**Foreground layer** — the same five icons rendered in the active colour, but clipped by `overflow: hidden` to `fillPct%` of the total width. This creates a smooth partial-fill effect at any decimal value without needing clip-path (which can be unreliable in flex/grid contexts).

**Fill percentage** is calculated as:
```
fillPct = (displayValue / 5) * 100
```
Where `displayValue` is either the live hover/touch value or the committed `initialRating`.

**Why `overflow: hidden` instead of `clip-path`:** clip-path is relative to the element's own box and behaves unexpectedly when the element is inside a flex or grid container. The `overflow: hidden` + fixed inner width approach is reliable in all layout contexts.

---

## Half-star precision

The rating scale runs from 0.5 to 5 in 0.5 increments (10 possible values). This is achieved by rendering **10 transparent radio labels** stacked over the 5 icons, each exactly `iconSize / 2` pixels wide. The left half of each icon maps to the `.5` increment, the right half to the whole number:

```
Icon 1        Icon 2        Icon 3        Icon 4        Icon 5
[0.5][1.0]   [1.5][2.0]   [2.5][3.0]   [3.5][4.0]   [4.5][5.0]
```

---

## Interaction modes

### Mouse (desktop)
- `onMouseEnter` on each label → sets `hoverValue` to that label's rating value → updates the foreground fill in real time
- `onMouseLeave` on the fieldset → clears `hoverValue` → fill returns to committed value
- Clicking a label → triggers the radio `onChange` → calls `handleRatingChange`

### Touch / swipe (mobile)
- `onTouchMove` on the fieldset → calls `ratingFromClientX` to calculate which rating the finger is over → sets `hoverValue` → updates fill in real time
- `onTouchEnd` on the fieldset → commits `hoverValue` via `handleRatingChange`, then clears it
- `touch-action: none` on the container prevents the browser from scrolling while the user swipes across the rating. `e.preventDefault()` is not used because React registers touch listeners as passive by default (meaning `preventDefault` is silently ignored) — the CSS property is the correct solution.

### `ratingFromClientX` helper
Converts an absolute screen X coordinate into a clamped half-star rating:
```typescript
function ratingFromClientX(fieldset: HTMLFieldSetElement, clientX: number): number {
  const rect = fieldset.getBoundingClientRect();
  const x = Math.max(0, clientX - rect.left);       // position within the fieldset
  return Math.max(0.5, Math.min(5, Math.ceil((x / rect.width) * 10) / 2));
  // (x / width) → 0–1 fraction
  // × 10         → 0–10 (tenths)
  // Math.ceil    → round up to nearest tenth
  // / 2          → convert to 0.5-step rating
}
```

### Keyboard
Radio inputs are visually hidden (`sr-only`) but fully functional. Tab moves focus to the fieldset, arrow keys move between the 10 radio options. `focus-within:ring-2` on each label shows a focus ring around the active icon area.

---

## Accessibility (read-only mode)

The read-only branch renders a `<div>` with:
- `role="img"` — tells screen readers this is a static image, not an interactive control
- `aria-label="{value} out of 5"` — announces the numeric value

Both layers are `aria-hidden="true"` since the label carries all the semantic information.

---

## Icon variants

| Variant | Source | Active colour | Inactive colour |
|---|---|---|---|
| `flame` (default) | Iconify `f7:flame-fill` | App primary (orange) | Zinc 500 |
| `star` | Iconify `tabler:star-filled` | Yellow 300 | Gray 500 |

New variants can be added to the `ICON_VARIANTS` record at the top of the file — provide an SVG `<path>`, `viewBox`, `activeFillColor`, and `inactiveFillColor`.
