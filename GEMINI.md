# Project Resonance - Context & Guidelines

This project is a modern web application built with **Next.js 16** and **React 19**, utilizing **Tailwind CSS 4** and **shadcn/ui** for styling and components.

## Project Overview

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (New York style)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Utilities:** `clsx`, `tailwind-merge` (via `src/lib/utils.ts`)

## Directory Structure

- `src/app/`: Contains the Next.js App Router pages, layouts, and global styles.
- `src/lib/`: Shared utility functions (e.g., `cn` for Tailwind class merging).
- `src/components/`: (Expected) Reusable UI components, typically organized into `ui/` for shadcn components.
- `public/`: Static assets like images and fonts.

## Building and Running

The project uses `npm` for package management.

- **Development:** `npm run dev` - Starts the development server at `http://localhost:3000`.
- **Build:** `npm run build` - Creates an optimized production build.
- **Start:** `npm run start` - Runs the production server after building.
- **Lint:** `npm run lint` - Runs ESLint to check for code quality issues.

## Development Conventions

### Path Aliases
The project uses the `@/` alias to refer to the `src/` directory, as defined in `tsconfig.json`.
- `@/components/*` -> `src/components/*`
- `@/lib/*` -> `src/lib/*`
- `@/hooks/*` -> `src/hooks/*`

### Styling & UI
- **Tailwind CSS 4:** Uses the latest version of Tailwind. Configuration is managed via PostCSS and Tailwind's internal engine.
- **shadcn/ui:** Follows the "New York" style. Components should be added using the `shadcn` CLI or placed in `src/components/ui/`.
- **Class Merging:** Always use the `cn()` utility from `@/lib/utils` when merging Tailwind classes or handling conditional classes.

### Coding Style
- Follow standard Next.js and React patterns (Server Components by default, Client Components when necessary with `"use client"`).
- Ensure strict TypeScript typing for all components and utilities.
