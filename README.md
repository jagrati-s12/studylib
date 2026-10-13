# Notes App

A modern, feature-rich note-taking application built with React, TypeScript, and Vite. Create, edit, and organize your notes with a beautiful rich text editor powered by Tiptap.

## Features

- **Rich Text Editor**: Full-featured editor with formatting options (bold, italic, underline, lists, and more)
- **Modern UI**: Clean and intuitive interface built with React 19 and Tailwind CSS
- **Resizable Panels**: Flexible layout with resizable sidebar and content areas
- **Type-Safe**: Built entirely in TypeScript for better developer experience and fewer bugs
- **Fast Development**: Powered by Vite for lightning-fast HMR and build times
- **Client-Side Routing**: Smooth navigation with React Router
- **State Management**: Efficient data fetching and caching with TanStack Query

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
