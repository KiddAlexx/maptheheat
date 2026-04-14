---
name: modern-tailwind
description: Write clean, modern, concise Tailwind CSS code. Use whenever working on or reviewing Tailwind CSS code.
---

# Tailwind CSS Best Practices

This project uses **Tailwind CSS v3** with a `tailwind.config.js` file and the **HeroUI**
component library.

## Theme Configuration

The theme is configured in `tailwind.config.js`. Custom tokens (colors, fonts, spacing)
are defined there. CSS variables for HeroUI colors are declared in `src/index.css`.

- Custom theme colors: orange primary, red danger, green success
- HeroUI integration is set up in `tailwind.config.js` — do not remove it
- Do not migrate to Tailwind v4 CSS-first config; this project uses v3

## HeroUI Components

- **PREFER** HeroUI components over building from scratch
- Do not import HeroUI inside service files or context reducers
- Check the HeroUI docs before reaching for a custom implementation

## Layout Best Practices

Prefer grid for 2D layouts. Prefer flex for 1D alignment.

```html
<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  <div class="flex items-center justify-between"></div>
</div>
```

## Core Principles

- Prefer utility classes over custom CSS for most styling
- Keep class lists readable by grouping: layout → spacing → typography → color → effects
- Use semantic HTML first; utilities should enhance, not replace structure

## Variants & State

- Use `hover`, `focus-visible`, `disabled`, and `motion-safe` variants where appropriate
- Prefer `data-*` and `aria-*` variants for stateful styling tied to DOM semantics
- Use `group` and `peer` for parent/sibling state without extra JS

## Responsive Design

- Start with base (mobile) styles, then add responsive variants (`sm`, `md`, `lg`, ...)
- Use container query utilities when layout depends on parent size rather than viewport

## Maintainability

- Extract reusable UI into components instead of repeating large class strings
- Keep class names deterministic; avoid dynamic string concatenation when possible
