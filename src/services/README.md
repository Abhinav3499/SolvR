# Services Package

## Overview
Provides external infrastructure clients and network service initializers, specifically managing the offline-first Supabase PostgreSQL client instance.

## Interface
- `[supabase.ts:isSupabaseConfigured]`: Checks whether `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided and non-placeholder.
- `[supabase.ts:supabase]`: Exported `SupabaseClient` instance when credentials are valid, or `null` in offline-fallback mode.
- `[supabase.ts:UserProfile]`: Domain interface representing cloud profile records.
- `[supabase.ts:FriendActivityItem]`: Domain interface representing social activity feed entries.

## Invariants
- None

## Side Effects
- None

## Verification
- Run: `npm test`
