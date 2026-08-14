# SONIC 🎙️

Sonic is a high-performance, AI-powered text-to-speech platform featuring voice cloning and synthesis, built with a serverless-first architecture.

## ✨ Features

- **Voice Cloning:** Create custom voices from short audio samples.
- **Turbo TTS:** Fast, high-quality audio generation using GPU-accelerated Modal functions.
- **Organization Support:** Multi-tenant workspace management via Clerk.
- **Usage-Based Billing:** Seamless subscription management and metering with Polar.sh.
- **Modern UI:** Polished interface built with React 19 and Tailwind CSS 4.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Components)
- **UI:** [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **API:** [tRPC](https://trpc.io/) (Typesafe end-to-end API)
- **Database:** [PostgreSQL](https://www.postgresql.org/) + [Prisma](https://www.prisma.io/)
- **Auth:** [Clerk](https://clerk.com/) (Session & Organization Management)
- **Storage:** [AWS S3](https://www.cloudflare.com/developer-platform/r2/) (S3-compatible)
- **TTS Engine:** [Modal](https://modal.com/) (Python, FastAPI, GPU Inference)
- **Billing:** [Polar.sh](https://polar.sh/) (Subscription & Metering)

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v20+)
- Python (for local Modal development)
- A PostgreSQL database

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` (if available) or ensure the following are set:
- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`
- `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
- `POLAR_ACCESS_TOKEN`, `POLAR_SERVER`
- `CHATTERBOX_API_URL`, `CHATTERBOX_API_KEY`

### 4. Database Initialization
```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Running the App
```bash
npm run dev
```

## 📁 Project Structure

Resonance uses a feature-based organization to keep the codebase scalable:

- `src/features/`: Core business logic (voices, text-to-speech, billing).
- `src/app/`: Next.js App Router and API routes.
- `src/trpc/`: Typesafe API definitions and routers.
- `src/lib/`: Shared client/server utilities (DB, S3, Polar).
- `src/components/ui/`: Low-level shadcn/ui components.
- `chatterbox_tts.py`: The Modal-deployed Python TTS engine.

## 📖 Documentation

For more detailed information, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Deep dive into the system design and data flow.
- [CONVENTIONS.md](./CONVENTIONS.md) - Coding standards and best practices.
- [SECURITY.md](./SECURITY.md) - Security policies and reporting.
- [DESIGN.md](./design.md) - UI/UX philosophy and design system.

## 🛡️ Security

Security is a top priority. Please refer to our [Security Policy](./SECURITY.md) for details on our practices and how to report vulnerabilities.
