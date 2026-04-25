# Repository Guidelines

## Project Structure & Module Organization
This repository is a small Next.js 16 app using the App Router. Application routes, layout, and global styles live in `src/app/`. Shared utilities belong in `src/lib/`; `src/lib/utils.ts` currently exposes the `cn()` class-merging helper. Static assets such as SVGs and icons live in `public/`. Root config files include `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, and `components.json`.

## Build, Test, and Development Commands
Use `npm run dev` to start the local development server at `http://localhost:3000`. Use `npm run build` to create a production build, and `npm run start` to serve that build locally. Use `npm run lint` to run ESLint across the project; this is the main automated quality gate currently available.

## Coding Style & Naming Conventions
Write TypeScript with `strict` mode in mind and prefer `.tsx` for React components. Follow the existing style: double quotes, semicolons in app files, and clear named exports for shared helpers. Use PascalCase for React components, camelCase for functions and variables, and lowercase route segment names under `src/app` such as `src/app/about/page.tsx`. Keep styling in Tailwind utility classes and global theme tokens in `src/app/globals.css`.

## Testing Guidelines
There is no test framework configured yet. Before opening a PR, run `npm run lint` and `npm run build` to catch type, lint, and integration issues. When tests are added, place them alongside the feature or in a dedicated `src/__tests__/` area, and name files `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines
Git history is minimal and uses short, sentence-style summaries such as `first commit` and `Initial commit from Create Next App`. Continue using brief, focused commit messages that describe one change clearly. Pull requests should include a short description, linked issue if applicable, local verification notes, and screenshots for UI changes.

## Configuration Notes
Use the `@/*` import alias from `tsconfig.json` instead of long relative paths. Do not commit build output from `.next/` or dependencies from `node_modules/`.
