# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application using the App Router with TypeScript. The application integrates with Clerk for authentication and Prisma for database operations with PostgreSQL. It's designed as a text-to-speech (TTS) service that processes requests through Modal and stores audio files in S3.

## Key Technologies

- **Next.js 16** with App Router
- **Clerk** for authentication
- **Prisma** with PostgreSQL for data persistence
- **Tailwind CSS** and **shadcn/ui** for styling
- **TypeScript** for type safety

## Common Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages and layouts
├── components/       # Shared UI components (shadcn/ui)
├── lib/              # Shared utilities
├── hooks/            # Custom React hooks
├── generated/        # Prisma client generated files
├── proxy.ts          # API proxy configuration
├── server/          # Server-side logic (if exists)
└── db/               # Database schema and migrations

prisma/               # Prisma schema and migrations
```

## Architecture

### Data Flow
User → Next.js API → Modal (TTS) → S3 → Response URL

### Core Models
1. **Voice** - Represents voice profiles with categories and variants
2. **Generation** - Represents audio generation requests with parameters

### Key Modules
- `/app` - Frontend pages and server actions
- `/lib` - Shared utilities
- `/components` - UI components from shadcn/ui
- `/prisma` - Database schema and client

## Development Guidelines

### Coding Conventions
- Use TypeScript with strict mode
- Prefer `.tsx` for React components
- Use PascalCase for components, camelCase for functions/variables
- Use tRPC for API communication
- Use Zod for validation
- Use S3 for media storage
- Prefer server actions over REST when possible

### Styling
- Use Tailwind utility classes
- Keep styling in global theme tokens in `src/app/globals.css`
- Use the `@/*` import alias from `tsconfig.json`

### Testing
Currently no test framework is configured. Before PR:
- Run `npm run lint`
- Run `npm run build` to catch type and integration issues

## Environment Variables

The application uses environment variables for configuration:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - For Clerk authentication
- `CLERK_SECRET_KEY` - For Clerk authentication

## Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

## UI Components

The project uses shadcn/ui components which are located in `src/components/ui/`. The component library includes:
- Alert, Breadcrumb, Button, Card, Dialog, etc.
- All components use Tailwind CSS and Radix UI primitives

## API Structure

API routes are defined using Next.js App Router conventions in `src/app/api/` directory. Server actions are preferred over traditional REST endpoints.