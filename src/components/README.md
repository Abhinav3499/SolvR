# Components Package

## Overview
Vue 3 single-file components implementing the glassmorphic user interface, LeetCode 1-year monthly heatmaps, modal dialogs, search/filter controls, and question list cards.

## Interface
- `[ActivityHeatmap.vue]`: 1-year LeetCode activity heatmap displaying 12 individual calendar month blocks, streak stats, and 7-day review alerts (emits: `filter-due`).
- `[AuthModal.vue]`: Cloud authentication and Supabase PostgreSQL sync controller modal (emits: `close`).
- `[BaseModal.vue]`: Reusable glassmorphic modal wrapper rendering into DOM body (props: `title`, `confirmText`; emits: `close`, `confirm`).
- `[ConfirmModal.vue]`: Reusable destructive confirmation modal (props: `itemName`, `message`; emits: `close`, `confirm`).
- `[ExportImportModal.vue]`: Data backup and export queue modal (emits: `close`).
- `[HeaderBar.vue]`: App header displaying SolvR branding, daily streak pill, theme toggle, and action buttons (emits: `add-topic`, `open-auth`, `open-social`, `open-quick-add`).
- `[NotesModal.vue]`: Markdown notes editor modal for specific questions (props: `question`; emits: `close`).
- `[QuestionModal.vue]`: Modal for creating or editing DSA questions (props: `topicId`, `subTopicId`, `question`; emits: `close`).
- `[QuestionRow.vue]`: Question list item row displaying title, link, difficulty, solved/starred/revision toggles, and 7d+ due alerts (props: `question`; emits: `open-notes`, `edit`, `delete`).
- `[QuickProblemModal.vue]`: Instant URL importer and 1-click bookmarklet/extension setup modal (props: `initialUrl`, `initialTitle`, `initialDifficulty`, `initialPlatform`; emits: `close`, `added`).
- `[SearchFilter.vue]`: Real-time query search bar with difficulty and completion status filter dropdowns.
- `[SocialModal.vue]`: Coding partners and peer leaderboard modal with follow toggles (emits: `close`).
- `[SubTopicModal.vue]`: Modal for adding or editing subtopics within a topic (props: `topicId`, `subTopic`; emits: `close`).
- `[TopicCard.vue]`: Collapsible, draggable topic container displaying subtopics, questions, and progress bars (props: `topic`, `filteredQuestionIds`; emits topic and question actions).
- `[TopicModal.vue]`: Modal for creating or editing top-level topics (props: `topic`; emits: `close`).

## Invariants
- `[ActivityHeatmap.vue:isCurrentMonth]`: Matches month block against active calendar year and short month name.
- `[HeaderBar.vue:progressPercentage]`: Guards against division by zero requiring `progress.total > 0`.
- `[QuestionRow.vue:isDueForReview]`: Flagged only when question is starred or marked for revision, and last practiced 7+ days ago.
- `[QuickProblemModal.vue:canSave]`: Guards against saving when title, topic ID, or new topic name is empty.
- `[TopicModal.vue:handleSave]`: Guards against saving empty trimmed topic names.

## Side Effects
- `[BaseModal.vue:Teleport]`: Renders modal overlay to `document.body` via Vue Teleport.
- `[HeaderBar.vue:applyTheme]`: Mutates document root DOM attribute `data-theme`.
- `[ActivityHeatmap.vue:onMounted]`: Sets horizontal scroll position of heatmap container to show current month.
- `[AuthModal.vue:triggerCloudSync]`: Invokes remote Supabase database sync via `authStore`.

## Verification
- Run: `npm test`
