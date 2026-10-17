# Personal Study Library & Notes App

A modern, feature-rich study library, notes, and task management application built with React, TypeScript, and Vite. Organize your subjects, indexed chapters, materials (PDFs, PPTs, handwritten notes, digital notes in folders), and manage todos with checklists and due dates across day, week, and month views.

## Features

- **Enhanced Todo Management**: Create todos with interactive checklists and due dates, filterable by All, Day, Week, and Month views.
- **Exam Preparation & Study Plan**: Track exams, syllabus topics, topic status, estimated study time, and suggested revision dates (`/study-plan`).
- **Pomodoro Focus Timer**: Configurable focus/break timer with completed focus-session history (`/pomodoro`).
- **Study Analytics Dashboard**: Review focus time, recent sessions, syllabus mastery, and upcoming exams (`/study-dashboard`).
- **Global Search**: Press `Ctrl+K` or `⌘K` to search subjects, topics, and app pages.
- **Spaced Review Controls**: Rate flashcard recall and schedule the next review interval (prototype implementation).
- **PDF Study Notes**: Attach locally saved study notes to an opened PDF material.
- **Subject & Indexed Topic Drill-Down**: Custom subject color presets and Lucide icon picker, clickable subject cards with indexed chapters/topics (`#1`, `#2`, etc.).
- **Nested Material Folders**: Organize study materials into custom folders (digital notes, PDFs, lecture notes, attachments) with multi-pane split viewing.
- **Rich Text Editor**: Full-featured editor for note-taking and documentation.
- **Modern UI & Dark Mode**: Clean interface built with Tailwind CSS with seamless dark/light theme support.
- **Fast Development**: Powered by Vite and TypeScript for type safety and speed.

## Prototype data notes

The new study-plan data, focus-session history, flashcard review schedule, and per-PDF study notes currently use browser `localStorage`. They are saved per browser/device and are not synced to an account or another device. The suggested study plan uses a simple prioritization heuristic, not a full optimization engine. The PDF reader uses the browser-native viewer; the added study-note panel is separate from in-PDF highlight/annotation tools.

## Additional routes

- `/pomodoro` — focus timer and completed session history
- `/study-plan` — exam list, syllabus tracker, suggested revision plan
- `/study-dashboard` — learning analytics overview

## Tech Stack

### Core
- **React 19.2** - UI library
- **TypeScript 6.0** - Type safety and better DX
- **Vite 8.3** - Build tool and dev server

### UI & Styling
- **Tailwind CSS 4.3** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Resizable Panels** - Flexible layout components

### Editor
- **Tiptap** - Headless rich text editor
  - Starter Kit for common extensions
  - Placeholder support
  - Underline extension

### Utilities
- **React Router DOM** - Client-side routing
- **TanStack Query** - Data fetching and state management
- **UUID** - Unique identifier generation

### Development Tools
- **Oxlint** - Fast JavaScript/TypeScript linter
- **Vite Plugin React** - React support for Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "notes app"
```

2. Navigate to the frontend directory:
```bash
cd frontend
```

3. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is busy).

### Building for Production

Create an optimized production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

### Linting

Run the linter:
```bash
npm run lint
```

## Project Structure

```
notes app/
├── frontend/
│   ├── src/              # Source files
│   ├── public/           # Static assets
│   ├── dist/             # Production build
│   ├── index.html        # Entry HTML file
│   ├── package.json      # Dependencies and scripts
│   ├── tsconfig.json     # TypeScript configuration
│   ├── vite.config.ts    # Vite configuration
│   └── .oxlintrc.json    # Linter configuration
├── ui design/            # Design files and mockups
└── README.md             # This file
```

## Configuration Files

- **tsconfig.json** - Base TypeScript configuration
- **tsconfig.app.json** - App-specific TypeScript settings
- **tsconfig.node.json** - Node-specific TypeScript settings
- **vite.config.ts** - Vite build and dev server configuration
- **.oxlintrc.json** - Oxlint linting rules
- **.gitignore** - Git ignore patterns

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run linting and ensure the build passes
4. Commit your changes with clear, descriptive messages
5. Push to your branch and create a pull request

## License

This project is private and not currently licensed for public use.

## Support

For issues or questions, please open an issue in the repository.

---

Built with ❤️ using React and TypeScript


