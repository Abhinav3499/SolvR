# Supabase PostgreSQL Database Schema

## Overview
Defines the relational PostgreSQL schema, Row Level Security (RLS) policies, triggers, and logical replication publications for SolvR cloud persistence and social features.

## Interface
- `[schema.sql:public.profiles]`: User profile table linked to `auth.users` with streak metrics and leaderboard visibility.
- `[schema.sql:public.handle_new_user]`: Trigger function (`security definer`) creating a public profile row on user signup.
- `[schema.sql:on_auth_user_created]`: Trigger executing `public.handle_new_user()` after user insertion.
- `[schema.sql:public.topics]`: Topic hierarchy table scoped to authenticated users.
- `[schema.sql:public.subtopics]`: Subtopic category table scoped to users and topics.
- `[schema.sql:public.questions]`: Comprehensive DSA question records (difficulty, status flags, timestamps).
- `[schema.sql:public.activity_logs]`: Daily problem solve history records for multi-device heatmap syncing.
- `[schema.sql:public.follows]`: User-to-user social follow graph for coding partners.
- `[schema.sql:public.company_tags]`: Curated LeetCode/Codeforces company question mappings synchronized from GitHub repositories.
- `[schema.sql:public.notifications]`: In-app notification queue for spaced repetition alerts, streak warnings, and system announcements.
- `[schema.sql:public.user_notification_settings]`: User preferences for email reminders, preferred notification hour, and frequency.
- `[schema.sql:public.shared_sheets]`: Hybrid sharing persistence for roadmaps exceeding URL hash length limits (>2 KB).
- `[schema.sql:public.sync_metadata]`: Background synchronization state caching target repository Git commit SHAs.
- `[schema.sql:supabase_realtime]`: Realtime publication enabling logical replication for `profiles`, `activity_logs`, `follows`, and `notifications`.

## Invariants
- `[schema.sql:public.profiles]`: Primary key `id` references `auth.users(id)` with cascading deletion.
- `[schema.sql:public.profiles]`: `username` is unique across all profiles.
- `[schema.sql:public.profiles]`: Row Level Security restricts `SELECT` to public profiles (`is_public = true`) or profile owners (`auth.uid() = id`).
- `[schema.sql:public.profiles]`: Row Level Security restricts `INSERT` and `UPDATE` strictly to profile owners (`auth.uid() = id`).
- `[schema.sql:public.topics]`: Composite primary key `(id, user_id)` with RLS enforcing `auth.uid() = user_id`.
- `[schema.sql:public.subtopics]`: Composite primary key `(id, user_id)` with RLS enforcing `auth.uid() = user_id`.
- `[schema.sql:public.questions]`: Composite primary key `(id, user_id)` with RLS enforcing `auth.uid() = user_id`.
- `[schema.sql:public.activity_logs]`: Unique composite constraint on `(user_id, question_id, solved_date)` preventing duplicate same-day solve records.
- `[schema.sql:public.follows]`: Composite primary key `(follower_id, following_id)` with RLS restricting mutations to `auth.uid() = follower_id`.

## Side Effects
- `[schema.sql:on_auth_user_created]`: Automatically creates a new `public.profiles` row when a user registers.
- `[schema.sql:public.profiles]`: Cascading deletion removes all associated topics, subtopics, questions, activity logs, and follow edges upon user account deletion.
- `[schema.sql:supabase_realtime]`: Broadcasts database change events across active connected client WebSockets.

## Verification
- Run: `npm test`
