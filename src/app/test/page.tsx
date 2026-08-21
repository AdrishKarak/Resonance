/**
 * -----------------------------------------------------------------------------
 * Test / Debug Page
 * -----------------------------------------------------------------------------
 * A developer-only smoke-test page at `/test` that queries every Voice record
 * directly from Prisma and renders them in a simple card grid. It exists to
 * verify the database connection and seeded voice data during development.
 * It performs no auth checks and is excluded from crawlers via `robots.ts`,
 * so it should never be linked from production UI or deployed publicly.
 */
import { prisma } from "@/lib/db"

/**
 * TestPage fetches all voices server-side (no pagination, no filtering) purely
 * for debugging purposes.
 *
 * @returns A grid listing each voice's name and variant, with a total count.
 */
export default async function TestPage() {
    // Direct Prisma access instead of tRPC — this page intentionally bypasses
    // the API layer to isolate database connectivity issues.
    const voices = await prisma.voice.findMany()
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">
                Voices ({voices.length})
            </h1>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {voices.map((voice) => (
                    <li key={voice.id} className="bg-white p-4 rounded-lg shadow">
                        <span className="font-semibold">{voice.name}</span>
                        <p className="text-sm text-red-500">{voice.variant}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}               