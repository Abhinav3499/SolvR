# Source Code Core (`src`)

## Overview
The primary application source tree containing the Vue 3 entry point, root application layout, domain models, state stores, UI components, data services, and analytical utilities for SolvR.

## Local Interface & Invariants
- `[main.ts:app]`: Main application initialization script mounting Pinia state and root `App.vue` to `#app`.
- `[App.vue]`: Root view orchestrating top-level layout, drag-and-drop topic cards, modal dialog states, and URL query parameter detection for quick problem imports (`?quickAdd=1`).
- `[style.css]`: Global design system tokens defining glassmorphism CSS variables, atmospheric mesh background, responsive breakpoints, and dark/light mode themes.

## Subdirectories & Boundaries
- [components](./components/README.md) - Glassmorphic Vue SFCs, LeetCode monthly heatmaps, modal controllers, and question list rows.
- [data](./data/README.md) - Default seed datasets and initial interview problem collections.
- [services](./services/README.md) - External clients and offline-first Supabase PostgreSQL client initialization.
- [stores](./stores/README.md) - Pinia state stores managing local reactive persistence, authentication, and cloud sync.
- [types](./types/README.md) - TypeScript interfaces, unions, and domain contracts.
- [utils](./utils/README.md) - Pure utility engines for CSV parsing, Markdown/Anki export generation, URL problem parsing, and streak analytics.

## Verification
- Run: `npm test`
