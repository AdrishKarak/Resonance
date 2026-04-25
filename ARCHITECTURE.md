# Architecture

## Flow
User → Next.js API → Modal (TTS) → S3 → Response URL

## Modules
- /app → frontend + server actions
- /server → API logic
- /lib → shared utilities
- /db → Prisma schema

## TTS Pipeline
1. Request received
2. Validate input (Zod)
3. Send job to Modal
4. Store audio in S3
5. Return signed URL