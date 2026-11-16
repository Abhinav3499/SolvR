# Stores Package

## Overview
Pinia reactive state management stores controlling question management, reactive browser persistence, authentication state, and cloud database synchronization.

## Interface
- `[questionStore.ts:useQuestionStore]`: Core Pinia store managing topics, subtopics, questions, filter states, and streak statistics.
- `[questionStore.ts:useQuestionStore.topics]`: Reactive list of topics persisted to localStorage key `'qs-topics'`.
- `[questionStore.ts:useQuestionStore.questions]`: Reactive list of questions persisted to localStorage key `'qs-questions'`.
- `[questionStore.ts:useQuestionStore.activityLog]`: Daily question completion record persisted to localStorage key `'qs-activity'`.
- `[questionStore.ts:useQuestionStore.streakInfo]`: Computed streak analytics (current streak, longest streak, active days).
- `[questionStore.ts:useQuestionStore.getDueForReviewQuestions]`: Computed getter returning questions due for 7-day spaced repetition review.
- `[questionStore.ts:useQuestionStore.filteredQuestions]`: Computed getter filtering questions by search query, difficulty, and status.
- `[questionStore.ts:useQuestionStore.addTopic]`: Action creating a topic with auto-incremented order index.
- `[questionStore.ts:useQuestionStore.addQuestion]`: Action creating a question within a topic/subtopic.
- `[questionStore.ts:useQuestionStore.toggleSolved]`: Action toggling question solved state and updating activity history.
- `[authStore.ts:useAuthStore]`: Pinia store managing Supabase OAuth sessions, user profiles, and social following.
- `[authStore.ts:useAuthStore.user]`: Ref holding the authenticated Supabase user.
- `[authStore.ts:useAuthStore.leaderboard]`: Reactive public leaderboard ranked by total solved questions.
- `[authStore.ts:useAuthStore.friends]`: Computed list of followed users matching active leaderboard profiles.
- `[authStore.ts:useAuthStore.signInWithOAuth]`: Action initiating Google or GitHub OAuth authentication.
- `[authStore.ts:useAuthStore.syncLocalToCloud]`: Action performing batch synchronization of local topics, subtopics, questions, and activity logs to Supabase PostgreSQL.
- `[authStore.ts:useAuthStore.toggleFollow]`: Action toggling user follow relationship across local storage and cloud.

## Invariants
- `[questionStore.ts:deleteTopic]`: Cascading deletion ensures deleting a topic removes all nested subtopics and questions.
- `[questionStore.ts:deleteSubTopic]`: Cascading deletion ensures deleting a subtopic removes all its questions.
- `[questionStore.ts:addTopic]`: Order continuity sets new topic order to `Math.max(...topics.order, -1) + 1`.
- `[questionStore.ts:getDueForReviewQuestions]`: Questions are eligible for 7-day review only if starred or marked for revision, and not practiced in 7+ days.
- `[questionStore.ts:toggleSolved]`: Toggling solved state synchronizes date keys in `activityLog` and sets `solvedAt` / `lastPracticedAt` timestamps.
- `[authStore.ts:isLoggedIn]`: Evaluates strictly as `Boolean(user.value)`.
- `[authStore.ts:signInWithOAuth]`: Precondition requires Supabase client to be configured.

## Side Effects
- `[questionStore.ts:topics]`: Synchronizes topics, subtopics, questions, and activity logs to browser `localStorage`.
- `[authStore.ts:syncLocalToCloud]`: Performs batch network upserts to remote Supabase tables (`topics`, `subtopics`, `questions`, `activity_logs`, `profiles`).
- `[authStore.ts:signInWithOAuth]`: Triggers browser redirect to external OAuth provider.

## Verification
- Run: `npm test`
