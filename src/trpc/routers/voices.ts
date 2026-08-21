/**
 * -----------------------------------------------------------------------------
 * Voices router
 * -----------------------------------------------------------------------------
 * Read/delete procedures for voice assets, scoped per organization. Custom
 * voices belong to an org (with their sample audio in object storage), while
 * system voices are shared across all orgs. The UI's voice picker and voice
 * management pages consume `getAll`; the delete flow cleans up both the
 * database row and the stored audio sample.
 *
 * Voice *creation* is not here — it lives in `/api/voices/create` because it
 * needs multipart file upload handling.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import { deleteAudio } from "@/lib/r2";
import { createTRPCRouter, orgProcedure } from "../init";

export const voicesRouter = createTRPCRouter({
    /**
     * Lists voices available to the org, split into custom (org-owned) and
     * system (built-in) sets.
     *
     * @param input.query - Optional case-insensitive substring filter applied
     *   to voice name and description.
     * @returns `{ custom, system }` arrays; custom sorted newest-first,
     *   system alphabetically.
     */
    getAll: orgProcedure
        .input(
            z
                .object({
                    query: z.string().trim().optional(),
                })
                .optional(),
        )
        .query(async ({ ctx, input }) => {
            // Build a shared OR filter over name/description; empty when no query.
            const searchFilter = input?.query
                ? {
                    OR: [
                        {
                            name: {
                                contains: input.query, mode: "insensitive" as const
                            }
                        },
                        {
                            description: {
                                contains: input.query,
                                mode: "insensitive" as const,
                            },
                        },
                    ],
                }
                : {};

            // Fetch both variants concurrently; they are independent queries.
            const [custom, system] = await Promise.all([
                prisma.voice.findMany({
                    where: {
                        variant: "CUSTOM",
                        orgId: ctx.orgId,
                        ...searchFilter,
                    },
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        category: true,
                        language: true,
                        variant: true,
                    },
                }),
                prisma.voice.findMany({
                    where: {
                        variant: "SYSTEM",
                        ...searchFilter,
                    },
                    orderBy: { name: "asc" },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        category: true,
                        language: true,
                        variant: true,
                    },
                }),
            ]);

            return { custom, system };
        }),

    /**
     * Deletes a custom voice owned by the caller's org, along with its audio
     * sample in object storage.
     *
     * Flow:
     *  1. Look up the voice scoped to this org AND variant CUSTOM — the
     *     compound `where` makes cross-org deletion impossible.
     *  2. Delete the database row first (source of truth).
     *  3. Best-effort delete of the R2/GCS object; storage orphans are
     *     preferable to failing the request after the row is already gone.
     */
    delete: orgProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const voice = await prisma.voice.findUnique({
                where: {
                    id: input.id,
                    variant: "CUSTOM",
                    orgId: ctx.orgId,
                },
                select: { id: true, r2ObjectKey: true },
            });

            if (!voice) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Voice not found",
                });
            }

            await prisma.voice.delete({ where: { id: voice.id } });

            if (voice.r2ObjectKey) {
                // In production, consider background jobs, retires, cron jobs etc.
                // Swallow errors so a storage outage doesn't fail the mutation.
                await deleteAudio(voice.r2ObjectKey).catch(() => { });
            }

            return { success: true };
        }),
});