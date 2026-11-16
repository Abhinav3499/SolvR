# @solvr/server

Dedicated Fastify backend and BullMQ worker service for SolvR.

## Overview
`@solvr/server` provides real-time API routes, Git commit SHA-cached company tag synchronizations from public repositories, repeatable background queues for spaced repetition email dispatch, and shared sheet snapshot persistence.

## Key Features
- **Git SHA Caching**: Syncs LeetCode company problem frequency maps with commit SHA checks against `sync_metadata` to minimize GitHub API rate limits.
- **Repeatable BullMQ Workers**:
  - `company-tags-sync`: Daily job checking and upserting company tags.
  - `email-reminders`: Hourly timezone-aware worker checking spaced repetition settings and dispatching via Resend.
- **Offline / Local Fallback**: When Redis or Supabase are unconfigured, server routes operate gracefully in in-memory mode without throwing unhandled exceptions.

## API Endpoints
- `GET /health` - Service health status.
- `GET /api/tags/companies` - List companies with frequency counts.
- `GET /api/tags/companies/:name` - Problem list for a given company.
- `POST /api/share` - Save sheet snapshot payload and receive short link.
- `GET /api/share/:shortId` - Retrieve shared sheet snapshot.
- `GET /api/notifications` - User notifications (requires Supabase JWT Bearer).
- `PATCH /api/notifications/:id/read` - Mark notification as read.

## Scripts
- `npm run dev`: Starts the Fastify server with hot reload via `tsx watch`.
- `npm run build`: Compiles TypeScript to `dist/`.
- `npm run start`: Runs compiled production server from `dist/index.js`.
- `npm run worker:tags:once`: Executes a one-off standalone company tag synchronization.
- `npm test`: Runs Vitest test suite for workers and utilities.
