---
name: modern-browser-apis
description: Utilize built-in browser APIs (like Popover API, View Transitions etc) instead of building features manually via JavaScript. Use when using browser APIs.
---

# Using Modern Browser APIs

We prefer native, modern browser APIs — _standardized, widely supported, and high-leverage_ — to heavy external libraries or custom fallbacks. Use them to simplify logic, improve performance, and reduce bundle size where appropriate.

## Philosophy

- **PREFER** browser-native capabilities over third-party dependencies
- **PROGRESSIVE ENHANCE**: Always provide sensible fallbacks for APIs that aren't available in all clients
- **ASYNC & SECURE**: Use promise-based and secure context APIs for non-blocking, safe access

## Core & Widely Supported APIs

### Clipboard Async API

```ts
async function copyToClipboard(text: string): Promise<void> {
  if ('clipboard' in navigator) {
    await navigator.clipboard.writeText(text)
  }
}
```

- Non-blocking, promise-based
- Requires a user gesture (button click satisfies this)
- Always feature-detect before use

### View Transitions API

Native hardware-accelerated transitions between UI states. Always wrap in a feature
detection check and respect `prefers-reduced-motion`.

```ts
if ('startViewTransition' in document) {
  document.startViewTransition(() => updateUI())
} else {
  updateUI()
}
```

### UI & Interaction

- **Intersection Observer API** — Efficiently detect when elements enter/exit the viewport (lazy loading, infinite scroll).
- **ResizeObserver API** — React to element size changes without layout thrashing.
- **BroadcastChannel API** — Cross-tab communication in the same origin.

### Concurrency & Scheduling

- **Web Locks API** — Coordinate async access to shared resources (avoid races).
- **Scheduling API** — Prioritize/background non-essential work to improve responsiveness.

### Workers & Off-Main Thread

- **Web Workers API** — Run scripts off the main thread for intensive tasks.

## When to Use & How to Fallback

- **FEATURE DETECTION** is required before use:
  ```js
  if ('clipboard' in navigator) { … }
  ```

Always combine user gesture requirements (e.g., for clipboard) with permission checks.

## Best Practices

**ASYNC FIRST**: Prefer promise/async APIs to avoid blocking UI.

**PERMISSIONS UI**: Convey clearly to users when the browser will ask for access.

**SECURE CONTEXTS**: Use HTTPS; many APIs require secure contexts to function.

## General Principles

- Write code for browsers as platforms, not just JS engines
- Prefer native semantics over manual scroll handlers or custom implementations
- Reduce external dependencies where modern browser APIs suffice
