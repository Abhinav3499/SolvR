# Types Package

## Overview
Central TypeScript type definitions, domain interfaces, and schema contracts used across SolvR models, stores, components, and serialization routines.

## Interface
- `[index.ts:Difficulty]`: Union type `'Easy' | 'Medium' | 'Hard'`.
- `[index.ts:FilterStatus]`: Filter state union `'' | 'solved' | 'unsolved' | 'starred' | 'revision' | 'due'`.
- `[index.ts:FilterDifficulty]`: Difficulty filter union `'' | Difficulty`.
- `[index.ts:Theme]`: Theme union `'dark' | 'light'`.
- `[index.ts:Topic]`: Topic entity interface with `id`, `name`, `order`.
- `[index.ts:SubTopic]`: SubTopic entity interface with `id`, `topicId`, `name`, `order`.
- `[index.ts:Question]`: Core question domain interface including difficulty, status flags, and review timestamps.
- `[index.ts:QuestionInput]`: Payload interface for creating new questions.
- `[index.ts:QuestionUpdate]`: Partial patch interface for editing existing questions.
- `[index.ts:Progress]`: Progress metric interface `{ solved: number, total: number }`.
- `[index.ts:SeedData]`: Initial pre-seeded collection interface `{ topics, subTopics, questions }`.
- `[index.ts:ImportMode]`: Merge strategy union `'replace' | 'merge'`.
- `[index.ts:ExportPayload]`: Full JSON backup payload contract.
- `[index.ts:ActivityLog]`: Daily question solve mapping `Record<string, string[]>`.
- `[index.ts:StreakInfo]`: Streak calculation metrics interface.
- `[index.ts:HeatmapDay]`: Grid cell representation for heatmaps.

## Invariants
- None

## Side Effects
- None

## Verification
- Run: `npm run type-check && npm test`
