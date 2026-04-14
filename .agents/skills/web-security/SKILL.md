---
name: web-security
description: Enforce web security and avoid security vulnerabilities. Use when handling user input, managing authentication/sessions, or other security-related tasks.
---

# Web Security

We treat **web security as a core requirement**, not an afterthought.
Assume hostile input and untrusted environments by default.

## Core Principles

- **NEVER** trust user input
- **ALWAYS** validate and sanitize data at boundaries
- Prefer secure defaults over configurability

## XSS & Injection

- **AVOID** `dangerouslySetInnerHTML` and raw HTML injection
- Escape and encode dynamic content properly
- Never interpolate untrusted data into HTML, CSS, or JS contexts
- Supabase uses parameterized queries by default — never construct raw SQL strings with user input

## Authentication & Authorization

- This project uses **Supabase Auth** (email/password + Google OAuth)
- Do not store tokens or credentials in localStorage
- Row Level Security (RLS) is enabled on all Supabase tables — never bypass it
- Always enforce authorization at the database level via RLS policies, not only in the UI
- The `status = 'approved'` filter on public-facing queries is a security boundary —
  never return `pending` content to non-admin users

## Image Upload Security

- All image uploads go through the service layer (`src/services/supabaseImageUploader.ts`)
- Never expose Supabase storage credentials or signed URL logic to untrusted inputs
- Client-side image compression (`browser-image-compression`) runs before upload —
  validate file type and size on the server side as well

## Data Handling

- Minimize data exposure — queries should return only the fields the client needs
- Do not log sensitive information (tokens, passwords, full user records)
- camelCase/snake_case conversion happens at the service boundary — never pass raw
  Supabase response objects directly to components

## Dependencies & Supply Chain

- Avoid unnecessary packages
- Treat third-party code as untrusted input

## Browser Security APIs

- Respect CORS, CSP, and browser security boundaries
- Avoid inline scripts and styles

## General Principles

- Simplicity reduces attack surface
- If unsure, choose the more restrictive option
