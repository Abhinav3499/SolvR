# Utils Package

## Overview
Pure utility functions and business logic modules handling CSV parsing, multi-format exports (Markdown, Anki flashcards), competitive programming URL parsing, and activity streak analytics.

## Interface
- `[csv.ts:parseCSVRows]`: Parses raw CSV text into a 2D string matrix, preserving quoted values and internal line breaks.
- `[csv.ts:parseCSVToQuestions]`: Parses CSV text into strongly typed `ParsedCSVQuestion` objects with validation.
- `[exportGenerators.ts:generateMarkdownExport]`: Generates a formatted Markdown study sheet from topics, subtopics, and questions.
- `[exportGenerators.ts:generateAnkiExport]`: Generates an Anki-compatible TSV flashcard deck string from questions and notes.
- `[problemParser.ts:parseProblemUrl]`: Auto-detects platform (LeetCode, Codeforces, GFG, HackerRank) and extracts structured problem details.
- `[problemParser.ts:slugToTitle]`: Converts URL slugs into capitalized problem titles.
- `[streak.ts:calculateStreak]`: Computes current consecutive streak, longest streak, active days, and daily solve count.
- `[streak.ts:generateSeparateMonthHeatmaps]`: Generates 12 individual calendar month blocks with 7-row aligned week grids.
- `[streak.ts:generateHeatmapDays]`: Generates a continuous 53-week submission heatmap with month marker labels.
- `[streak.ts:formatDateKey]`: Converts local Date objects to `'YYYY-MM-DD'` string keys.
- `[streak.ts:parseDateKey]`: Converts `'YYYY-MM-DD'` strings into local Date objects.

## Invariants
- `[csv.ts:parseCSVToQuestions]`: Requires at least one header row and one data row; skips rows with empty problem titles.
- `[exportGenerators.ts:generateMarkdownExport]`: Progress calculation guards against division by zero (defaults to 0% when total is 0).
- `[exportGenerators.ts:generateAnkiExport]`: Tabs in fields are sanitized to spaces to prevent TSV column corruption.
- `[problemParser.ts:parseProblemUrl]`: Defaults difficulty to `'Medium'` for LeetCode, Codeforces, and GeeksforGeeks; `'Easy'` for HackerRank.
- `[streak.ts:calculateStreak]`: Streak remains alive if yesterday was solved and today has not yet been practiced.
- `[streak.ts:generateSeparateMonthHeatmaps]`: Cell counts map strictly to visual levels: `0=0, 1=1, 2-3=2, 4-6=3, >=7=4`.

## Side Effects
- None

## Verification
- Run: `npm test`
