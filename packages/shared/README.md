# @solvr/shared

Shared TypeScript domain contracts, token codecs, and compression utilities used across the SolvR client SPA, Chrome extension, and Fastify server.

## Overview
`@solvr/shared` contains pure, isomorphic utilities and domain models with zero heavy runtime dependencies (only `lz-string` for URL compression). It ensures type parity and seamless serialization across all SolvR subprojects.

## Modules

### 1. Types (`src/types/`)
- **`question.ts`**: Pure problem definitions, difficulty tiers (`Easy`, `Medium`, `Hard`), status enums (`Todo`, `Solving`, `Solved`), and platforms (`LeetCode`, `Codeforces`, `GeeksforGeeks`, `HackerRank`, `Other`).
- **`sharing.ts`**: Shared roadmap snapshot contracts (`SharedSheetPayload`, `SharedSheetTopic`, `SharedSheetQuestion`) and unpack results.
- **`notification.ts`**: Notification entities, read status, direct route payloads, and spaced repetition alert models.

### 2. Codecs (`src/codecs/`)
- **`tokenCodec.ts`**: Compact serialization for problem references.
  - Format: `<Platform>:<ProblemID>:<Topic>:<Difficulty>`
  - Short codes: `LC` (LeetCode), `CF` (Codeforces), `GFG` (GeeksforGeeks), `HR` (HackerRank), `OTH` (Other).
  - Tiers: `E` (Easy), `M` (Medium), `H` (Hard).
- **`compressor.ts`**: URL-safe string compression via `lz-string` (`compressToEncodedURIComponent` / `decompressFromEncodedURIComponent`). Handles arbitrary sheet roadmap payloads with fallback safety.

## Scripts
- `npm run build`: Compiles TypeScript declarations and JavaScript outputs to `dist/`.
