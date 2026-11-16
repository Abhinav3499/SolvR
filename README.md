# SolvR Blueprint

[![CI](https://github.com/Abhinav3499/SolvR/actions/workflows/ci.yml/badge.svg)](https://github.com/Abhinav3499/SolvR/actions/workflows/ci.yml)

## System Overview
SolvR is an offline-first interview preparation and competitive programming question tracker built with Vue 3 and TypeScript. It features a modern glassmorphic interface, LeetCode-style 1-year monthly consistency heatmaps, 7-day spaced repetition reminders, multi-format export queues (Markdown, Anki flashcards), a dedicated free Supabase PostgreSQL cloud database with OAuth, and 1-click browser integration for LeetCode and Codeforces.

## Subdirectories & System Boundaries
- [src](./src/README.md) - Core frontend application source containing Vue components, Pinia stores, domain types, analytical utilities, and service clients.
- [packages/shared](./packages/shared/README.md) - Shared TypeScript domain contracts, compact token codecs, and `lz-string` URL compression utilities.
- [packages/server](./packages/server/README.md) - Dedicated Fastify backend and BullMQ worker service for Git SHA-cached company tags and spaced repetition email reminders.
- [extension](./extension/README.md) - Manifest V3 browser extension enabling 1-click problem ingestion from LeetCode, Codeforces, GeeksforGeeks, and HackerRank with Shadow DOM glassmorphic toast UI and main-world GraphQL interception.
- [supabase](./supabase/README.md) - PostgreSQL database schema definitions, migrations, Row Level Security (RLS) policies, triggers, and logical replication publications.

## Global Invariants
- **Offline-First Resilience**: All core question tracking, streak monitoring, search/filter, and sharing operations function seamlessly via `localStorage` even if backend and Supabase services are unconfigured or offline.
- **Strict Data Isolation**: Multi-user cloud operations in PostgreSQL are strictly partitioned by Row Level Security (RLS), restricting all CRUD modifications to `auth.uid() = user_id`.
- **7-Day Review Policy**: Questions marked as starred or revision that have not been practiced within 7 days (`Date.now() - 7 * 86400000`) are automatically highlighted for spaced repetition review.
- **Git SHA Caching**: Background tag synchronization validates remote repository commit SHAs against `sync_metadata` before executing network updates to eliminate redundant database writes.
- **Zero Hallucination / Grounded Contracts**: Code symbol boundaries, route parameters, and database schemas are verified directly against implementation source files.

## Global Side Effects
- **Browser Local Storage**: Reactive state synchronization automatically persists topics (`'qs-topics'`), subtopics (`'qs-subtopics'`), questions (`'qs-questions'`), and activity logs (`'qs-activity'`) to browser storage.
- **Supabase Cloud Sync**: Explicit user cloud sync triggers batch network upserts to remote PostgreSQL tables (`profiles`, `topics`, `subtopics`, `questions`, `activity_logs`).
- **OAuth Authentication**: External browser redirects to Google or GitHub authentication providers when cloud login is initiated.

## System Verification
- Run: `npm run lint && npm run type-check && npm test && npm run build`

---

## Tech Stack

- **Vue 3** (`<script setup lang="ts">`) - Frontend framework
- **TypeScript** - Strongly typed domain models, stores, and components across monorepo
- **Fastify & BullMQ** - Node.js microservice backend with Redis repeatable queues
- **Vite** - Lightning-fast frontend build tool and bundler
- **Pinia** - Strongly typed state management
- **Supabase** - PostgreSQL database with Row Level Security, Realtime, & OAuth
- **Vitest & @vue/test-utils** - Unit & component testing framework with v8 coverage
- **ESLint** - Automated code quality and linting
- **GitHub Actions** - Continuous Integration & Continuous Deployment
- **Lucide Vue Next** - Modern UI icons
- **VueDraggable** - Drag and drop topic and question reordering
- **@vueuse/core** - Reactive browser localStorage synchronization
- **lz-string** - URL-safe state compression for stateless roadmap sharing

## Getting Started

### Clone the repository

```bash
git clone git@github.com:Abhinav3499/SolvR.git
cd SolvR
```

### Install dependencies

```bash
npm install
```

### Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite local development server |
| `npm run build` | Builds shared package, runs `vue-tsc -b`, and generates production bundle |
| `npm run build:shared` | Compiles `@solvr/shared` package |
| `npm run build:server` | Compiles `@solvr/server` package |
| `npm run server:dev` | Runs Fastify backend with hot reload (`tsx watch`) |
| `npm run server:start` | Runs compiled production Fastify backend |
| `npm run worker:tags:once` | Runs one-off company tag sync script |
| `npm run type-check` | Type-checks all TypeScript files and Vue SFCs |
| `npm test` | Runs the full Vitest test suite across all packages |
| `npm run test:watch` | Runs tests in interactive watch mode |
| `npm run test:coverage` | Runs tests and generates a v8 coverage report |
| `npm run lint` | Analyzes code quality using ESLint |
| `npm run lint:fix` | Automatically fixes autofixable ESLint issues |
