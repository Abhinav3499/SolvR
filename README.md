# DSA Question Tracker

A clean and simple web app to help you track your Data Structures and Algorithms practice. Organize questions by topics, mark them as solved, star important ones, and keep track of your progress—all stored locally in your browser.

## About

I built this tracker to stay organized while preparing for coding interviews. You can create topics, add questions with difficulty levels and resource links, track which ones you've solved, and see your overall progress at a glance. Everything saves automatically in your browser, so your data stays with you.

## Tech Stack

- **Vue 3** - Frontend framework
- **Vite** - Build tool and dev server
- **Pinia** - State management
- **Lucide Vue Next** - Icons
- **VueDraggable** - Drag and drop functionality
- **@vueuse/core** - Composables for localStorage

## Getting Started

### Clone the repository

```bash
git clone <repository-url>
cd SolvR
```

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

### Seed with sample data

If you want to start with some pre-loaded questions, you can edit `src/data/seedData.js` and add your topics, sub-topics, and questions there. The file exports a simple object with three arrays. Just restart the dev server after making changes.

## Upcoming Features

- 🔌 **Chrome Extension** - Add questions directly from LeetCode or any coding platform with one click
- 🤝 **Share with Friends** - Generate shareable links to share your question sheets with others
- 📊 **Excel Export** - Download your progress and question list as an Excel file

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request

Feel free to open issues for bugs or feature requests!