# DSA Question Tracker (SolvR)

[![CI](https://github.com/Abhinav3499/SolvR/actions/workflows/ci.yml/badge.svg)](https://github.com/Abhinav3499/SolvR/actions/workflows/ci.yml)

A clean and simple web app to help you track your Data Structures and Algorithms practice. Organize questions by topics, mark them as solved, star important ones, and keep track of your progress—all stored locally in your browser.

## About

I built this tracker to stay organized while preparing for coding interviews. You can create topics, add questions with difficulty levels and resource links, track which ones you've solved, and see your overall progress at a glance. Everything saves automatically in your browser, so your data stays with you.

## Tech Stack

- **Vue 3** (`<script setup lang="ts">`) - Frontend framework
- **TypeScript** - Strongly typed domain models, stores, and components
- **Vite** - Lightning-fast build tool and bundler
- **Pinia** - Strongly typed state management
- **Vitest & @vue/test-utils** - Unit & component testing framework with v8 coverage
- **ESLint & Prettier** - Automated code quality and formatting
- **GitHub Actions** - Continuous Integration & Continuous Deployment
- **Lucide Vue Next** - Clean UI icons
- **VueDraggable** - Drag and drop topic and question reordering
- **@vueuse/core** - Reactive browser localStorage synchronization

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
| `npm run build` | Runs full TypeScript check (`vue-tsc -b`) and builds production bundle |
| `npm run type-check` | Type-checks all TypeScript files and Vue SFCs |
| `npm test` | Runs the full Vitest test suite |
| `npm run test:watch` | Runs tests in interactive watch mode |
| `npm run test:coverage` | Runs tests and generates a v8 coverage report |
| `npm run lint` | Analyzes code quality using ESLint |
| `npm run lint:fix` | Automatically fixes autofixable ESLint issues |

### Seed with sample data

If you want to start with pre-loaded questions, you can edit `src/data/seedData.ts` and add your topics, sub-topics, and questions there. The file exports a typed `SeedData` object.

## CI/CD Pipeline

- **Continuous Integration (`.github/workflows/ci.yml`)**: Automatically triggers on pushes and PRs to `main`, validating on Node 20 and Node 22 (linting, type-checking, test suite, and production build).
- **Continuous Deployment (`.github/workflows/deploy.yml`)**: Automatically builds and publishes the production bundle to GitHub Pages on merges to `main`.

## Upcoming Features

- **Chrome Extension** - Add questions directly from LeetCode or any coding platform with one click
- **Share with Friends** - Generate shareable links to share your question sheets with others
- **Excel Export** - Download your progress and question list as an Excel file

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes and verify with `npm run lint && npm test && npm run build`
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request
