# 🌶 MapTheHeat

MapTheHeat is a React application for discovering the _spiciest_ restaurants and shops in your city - powered by real user activity.

Users can explore venues via list or map, add reviews, save favourites, and submit new venues.

> The app is actively evolving. Planned improvements are outlined in the [roadmap](#-roadmap) below.

---

## 🌍 Live Demo

**Staging URL:** https://staging.maptheheat.com/  
**Status:** Fully functional using seeded demo data

---

## ✨ Features

- View venues on interactive map (Leaflet)
- View list of venues & filter by city and category (restaurants / shops)
- Sort venues and reviews by heat rating, quality rating etc
- Add venues - use the Nominatim API to fetch address details and coordinates
- Add/edit reviews
- Upload images (with venue, review or standalone)
- All submissions enter a pending moderation state
- Users receive automatic status notifications
- Submissions moderated using admin panel + user notified of result
- Save venues to favourites
- User profiles with:
  - Reviews added
  - Favourites
  - Notifications
  - Account updates (email, password, username, avatar)

### Moderation & backend rules

- Submissions can be **pending** and require approval
- Limits enforced at the database layer:
  - Max **2 pending venues** per user
  - Max **2 pending reviews** per user
  - Max **2 pending image sets** per user
- Enforced via Supabase database rules, row-level security, and SQL functions
- Client-side checks also provide early feedback

---

## 🛠 Tech Stack

**Frontend**

- React 18 + TypeScript
- Tailwind CSS
- TanStack React Query
- Vite
- React Router v6
- React Hook Form
- HeroUI
- Leaflet / React Leaflet

**Backend**

- Supabase (Postgres, Auth, Storage)

**Testing & Tooling**

- Vitest
- React Testing Library
- MSW
- ESLint + TypeScript strict mode
- Prettier
- CI with Github Actions
- Cloudflare Pages with pre deployment checks

---

## ♿ Accessibility

Accessibility is an ongoing focus:

- Semantic HTML structure
- Accessible names and ARIA attributes
- Keyboard navigation support
- Focus management in modals
- Accessible toast notifications
- Accessible error messaging
- Manual testing with screen reader

---

## 🚀 Deployment

Hosted on **Cloudflare Pages**  
Built with Vite

---

## 📌 Project Goals

This project was built to demonstrate:

- Feature-based folder structure
- Strict TypeScript
- Real-world moderation logic
- Testing discipline
- Accessibility awareness
- Scalable frontend patterns

---

## 🛣 Roadmap

- Expanded test coverage
- Extensive accessibility refinements
- UI refinements - Reduce reliance on component library where custom solutions provide better flexibility.
- Refactor shared UI state (modals/filters/sort) - reduce provider nesting and unnecessary re-renders (Context to Zustand)
