# SolvR Full-Stack Platform & Automated Ingestion Architecture

* **Author:** Abhinav Arya
* **Date:** 2026-11-16

## Overview

SolvR is currently a client-side, offline-first interview preparation and competitive programming tracker built with Vue 3, Vite, Pinia, and Supabase PostgreSQL. This specification defines the evolution of SolvR into a full-stack platform by introducing:
1. A dedicated TypeScript backend service (Fastify) paired with a Redis queue manager (BullMQ) for scheduled background tasks and transactional email reminders.
2. An automated GitHub company tag crawler that keeps company-specific problem tags (e.g. Google, Meta, Amazon) updated in PostgreSQL.
3. An in-page Chrome extension problem capture workflow utilizing network interception rather than DOM scraping.
4. Stateless, compressed snapshot share links for sharing curated sheets with zero database footprint, backed by a hybrid shortlink fallback for large datasets.
5. An in-app notification center and email digest pipeline for spaced repetition (7-day review intervals).

The core invariant of SolvR remains intact: the application must stay completely functional offline. The dedicated backend and Redis message queues operate strictly as an asynchronous enrichment layer and must never block local problem tracking.

## Analysis

### 1. Contrarian & Operational Simplicity (Skeptical Architect & YAGNI)
- **Dedicated Backend vs. Serverless Edge Functions**: 
  A dedicated Fastify container running alongside a stateful Redis instance introduces continuous operational overhead (container orchestration, memory footprint, uptime monitoring, and infrastructure cost). While Supabase Edge Functions with `pg_cron` can execute lightweight tasks, a dedicated Node.js service is justified here because:
  - Git repository cloning, archive decompression, and bulk diffing for company tags exceed the CPU time and memory boundaries of serverless functions.
  - BullMQ provides rate-limited email dispatch with exponential backoff, dead-letter queues, and timezone-aware scheduling that serverless webhooks struggle to manage reliably.
- **Offline-First Non-Negotiable Invariant**:
  If the Fastify backend, Redis cluster, or Supabase connection experiences an outage, the client application must continue operating locally without throwing blocking errors. All backend features (company tags, email dispatch, notification alerts) must degrade gracefully.

### 2. Inventive Problem Solving & Technical Contradictions (TRIZ)
- **Network Interception vs. Brittle DOM Scraping (TRIZ Principle #28 - Mechanics Substitution)**:
  Scraping LeetCode and Codeforces DOM elements (e.g. searching for class names or document headers) is brittle. LeetCode frequently updates its UI layouts, class names, and Next.js client-side hydration tree, breaking DOM scrapers. 
  *Resolution*: The Chrome extension intercepts LeetCode's internal GraphQL queries (`https://leetcode.com/graphql` for query `questionData`) and Codeforces API responses. By tapping the raw JSON payload in transit, the extension extracts the exact question ID, title slug, difficulty, official tags, and acceptance rate with zero DOM scraping risk.
- **Stateless URL Bloat vs. Shareability (TRIZ Principle #1 - Segmentation & #10 - Prior Action)**:
  Full JSON serialization of 50+ questions with titles and notes exceeds the 2,048 to 4,096 character URL limit enforced by modern browsers, web servers, and chat platforms (Slack, Discord, WhatsApp).
  *Resolution*: Implement a compact dictionary/token encoding. Since LeetCode problems have known numerical IDs (`1` = Two Sum, `15` = 3Sum), encode problems as compact comma-separated tokens (e.g., `LC:1,LC:2,LC:15,CF:158A`). A 60-question sheet compresses with `lz-string` into under 200 bytes. Sheets exceeding 2 KB automatically fallback to a database-stored shortlink (`/share/:shortId`).
- **GitHub API Rate Limits (TRIZ Principle #10 - Prior Action)**:
  Automated crawlers hitting the GitHub REST API without tokens face strict rate limits (60 requests per hour per IP).
  *Resolution*: Query GitHub's Git Commits API (`GET /repos/{owner}/{repo}/commits?path=data.json&page=1&per_page=1`) to inspect the latest commit SHA. If the commit SHA matches the value stored in PostgreSQL, the worker terminates immediately (consuming exactly 1 API call). If updated, the worker downloads the raw file archive from `raw.githubusercontent.com`, which is served via CDN without impacting API quotas.

### 3. UX and Developer Ergonomics
- **In-Page Capture Toast vs. Tab Redirects**:
  The existing prototype extension opened a new tab to `https://.../?quickAdd=1`, disrupting the user's focus on LeetCode. The modernized extension injects an unobtrusive glassmorphic toast notification directly into the page:
  `[✓ SolvR: "Two Sum" added to Dynamic Programming | Change Topic ▾ | Open in SolvR ↗]`.
- **Recipient Isolation on Shared Snapshot URLs**:
  Recipients opening a stateless share link (`https://solvr.dev/share#data=...`) must never have their local storage overwritten. The application loads the link in an ephemeral "Read-Only Snapshot" view with a banner offering options to: (1) `Save as New Roadmap`, (2) `Merge with My Problems`, or (3) `Close Preview`.
- **One-Click Extension Authentication**:
  Instead of requiring manual copy-pasting of API tokens into the Chrome extension popup, the web application provides a "Pair Extension" button using `chrome.runtime.sendMessage` via the extension's `externally_connectable` manifest configuration.

### 4. Codebase Architecture & System Boundaries
- **Monorepo Structure**:
  Transition the single root package into an npm/pnpm workspace topology:
  - `packages/client`: Existing Vue 3 + Vite SPA.
  - `packages/extension`: Manifest V3 Chrome Extension.
  - `packages/server`: Fastify TypeScript backend and BullMQ worker pipeline.
  - `packages/shared`: Shared TypeScript type contracts (`Question`, `Difficulty`, `SharePayload`, `NotificationDTO`) with zero external runtime dependencies.
  - `supabase/`: PostgreSQL schema, RLS policies, and database migrations.

## Goals vs. Non-Goals

### In-Scope Goals
- **Dedicated Backend Service**: Fastify application exposing endpoints for user notifications, tag queries, and extension authentication.
- **Background Message Queue**: Redis 7 / Upstash instance paired with BullMQ managing:
  - `cron-company-tags`: Daily sync of curated LeetCode company lists with Git SHA caching.
  - `email-reminders`: Hourly scan of user review intervals (7 days+) and timezone-aligned transactional email delivery.
- **Email Delivery Pipeline**: Integration with Resend for spaced repetition reminders with strict one-click unsubscribe headers.
- **Enhanced Manifest V3 Extension**: Content script with LeetCode/Codeforces network interception, SPA route transition listeners, and in-page toast confirmation.
- **Stateless & Hybrid Share Links**: URL hash compression (`lz-string`) with numerical ID tokens for lightweight sheets, falling back to a PostgreSQL shortlink table for payloads exceeding 2 KB.
- **PostgreSQL Database Extensions**: Migration tables for `company_tags`, `notifications`, and `user_notification_settings`.

### Out-of-Scope Non-Goals
- **Real-Time Collaborative Editing**: No multi-cursor or WebSocket live sheet synchronization (Google Docs style); sharing is strictly snapshot-based.
- **Cloud-Mandatory Lock-in**: SolvR will not require an account or internet connectivity for basic problem logging.
- **Scraping Premium LeetCode Solutions**: No scraping of copyrighted editorial solutions or paywalled problem statements.
- **Native Mobile Apps**: No native iOS/Android client apps; the responsive web UI remains the primary touchpoint.

## Alternatives Weighed

- **Pure DOM Scraping in Browser Extension**:
  *Rejected*: LeetCode and Codeforces regularly modify element class names, styling hierarchies, and client-side hydration routines. Network request interception captures raw JSON data before presentation, guaranteeing resilience against UI redesigns.
- **Naive Full-JSON URL Encoding**:
  *Rejected*: Storing complete question objects, descriptions, and user notes directly inside URL parameters causes URLs to exceed 4,000 characters for even moderate sheet sizes. Replaced with numerical ID dictionary tokenization (`LC:1,LC:15`) and a 2 KB hybrid shortlink fallback.
- **Serverless Edge Functions Exclusively (Supabase Edge + pg_cron)**:
  *Rejected for Background Workers*: While suitable for simple webhooks, serverless execution limits constrain large dataset parsing and prevent running persistent BullMQ rate limiters with exponential retry states. Fastify was selected for dedicated worker execution.
- **Polling GitHub API Without Commits Verification**:
  *Rejected*: Direct recursive file tree downloads quickly exhaust unauthenticated rate limits (60 req/hr). Replaced with single-request commit SHA comparison.

## Key Decisions & Staging for Next Steps

1. **Decision 1 (Structural Invariant)**: Offline-first behavior must be preserved. Fastify and Redis are non-critical dependencies; client features must function even if backend services are offline.
2. **Decision 2 (Extension Strategy)**: Implement Manifest V3 with declarativeNetRequest / GraphQL stream inspection and in-page toast UI.
3. **Decision 3 (Sharing Model)**: Deploy hybrid sharing: compressed hash parameters for small sheets (< 2 KB), Supabase shortlink table for larger collections.
4. **Decision 4 (Queue & Worker Topology)**: Use BullMQ on Redis for daily company tag sync crons and hourly timezone-aware email reminders via Resend.

### Staging for Next Steps
- **Stage 1**: Define shared data contracts in `packages/shared` and implement `lz-string` URL hash compression in the client.
- **Stage 2**: Implement the Manifest V3 network-interception content script and in-page toast for LeetCode and Codeforces.
- **Stage 3**: Scaffold `packages/server` with Fastify, BullMQ, and Redis; apply PostgreSQL migrations for `company_tags` and `notifications`.
- **Stage 4**: Implement the GitHub company tag sync worker with commit SHA polling and the Resend email reminder worker.
