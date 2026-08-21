/**
 * -----------------------------------------------------------------------------
 * Generations router (TTS pipeline)
 * -----------------------------------------------------------------------------
 * The core feature: reading and creating text-to-speech generations. The
 * `create` mutation orchestrates the full pipeline across every external
 * service in the stack:
 *
 *   1. Gate on an active Polar subscription for the org.
 *   2. Resolve the requested voice (system, or custom owned by the org) and
 *      its stored audio key.
 *   3. Call the chatterbox TTS API with the text + voice sample to get WAV
 *      bytes back.
 *   4. Persist a Generation row, upload the audio to object storage under
 *      `generations/orgs/<orgId>/<generationId>`, then link the storage key
 *      back onto the row (with compensating delete on failure).
 *   5. Ingest a usage event into Polar metering (best-effort; never blocks
 *      the user-facing result).
 *
 * Audio playback goes through `/api/audio/[generationId]`, which signs a
 * short-lived URL from the stored object key.
 */
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { polar } from "@/lib/polar";
import { env } from "@/lib/env";
import { TRPCError } from "@trpc/server";
import { chatterbox } from "@/lib/chatterbox-client";
import { prisma } from "@/lib/db";
import { uploadAudio } from "@/lib/r2";
import { TEXT_MAX_LENGTH } from "@/features/text-to-speech/data/constants";
import { createTRPCRouter, orgProcedure } from "../init";

export const generationsRouter = createTRPCRouter({
    /**
     * Fetches a single generation belonging to the caller's org.
     *
     * Internal fields (`orgId`, `r2ObjectKey`) are omitted from the response;
     * clients use the returned `audioUrl` to stream playback instead of the
     * raw storage key.
     */
    getById: orgProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const generation = await prisma.generation.findUnique({
                where: { id: input.id, orgId: ctx.orgId },
                omit: {
                    orgId: true,
                    r2ObjectKey: true,
                },
            });

            if (!generation) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            return {
                ...generation,
                // App-relative streaming endpoint backed by signed URLs.
                audioUrl: `/api/audio/${generation.id}`,
            };
        }),

    /**
     * Lists all generations for the caller's org, newest first, with internal
     * storage fields stripped.
     */
    getAll: orgProcedure.query(async ({ ctx }) => {
        const generations = await prisma.generation.findMany({
            where: { orgId: ctx.orgId },
            orderBy: { createdAt: "desc" },
            omit: {
                orgId: true,
                r2ObjectKey: true,
            },
        });

        return generations;
    }),

    /**
     * Generates speech for the given text using the selected voice.
     *
     * Enforces subscription gating, voice ownership, storage consistency
     * (DB row + object upload succeed together or are rolled back), and
     * usage metering. See the file-level doc for the full flow.
     *
     * @returns `{ id }` of the newly created generation.
     */
    create: orgProcedure
        .input(
            z.object({
                text: z.string().min(1).max(TEXT_MAX_LENGTH),
                voiceId: z.string().min(1),
                temperature: z.number().min(0).max(2).default(0.8),
                topP: z.number().min(0).max(1).default(0.95),
                topK: z.number().min(1).max(10000).default(1000),
                repetitionPenalty: z.number().min(1).max(2).default(1.2),
            })
        )
        .mutation(async ({ input, ctx }) => {
            // Check for active subscription before generation
            try {
                const customerState = await polar.customers.getStateExternal({ externalId: ctx.orgId });
                const hasActiveSubscription = (customerState.activeSubscriptions ?? []).length > 0;
                if (!hasActiveSubscription) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "SUBSCRIPTION_REQUIRED",
                    });
                }
            } catch (err) {
                if (err instanceof TRPCError) throw err;
                // Customer doesn't exist in Polar yet -> no subscription
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "SUBSCRIPTION REQUIRED",
                });
            }

            // Allow system voices for everyone, but custom voices only when
            // they belong to the caller's org.
            const voice = await prisma.voice.findUnique({
                where: {
                    id: input.voiceId,
                    OR: [
                        { variant: "SYSTEM" },
                        { variant: "CUSTOM", orgId: ctx.orgId, }
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    r2ObjectKey: true,
                },
            });

            if (!voice) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Voice not found",
                });
            }

            if (!voice.r2ObjectKey) {
                throw new TRPCError({
                    code: "PRECONDITION_FAILED",
                    message: "Voice audio not available",
                });
            }

            // Ask chatterbox to synthesize speech, cloning the voice from its
            // stored sample; response body is raw WAV bytes.
            const { data, error } = await chatterbox.POST("/generate", {
                body: {
                    prompt: input.text,
                    voice_key: voice.r2ObjectKey,
                    temperature: input.temperature,
                    top_p: input.topP,
                    top_k: input.topK,
                    repetition_penalty: input.repetitionPenalty,
                    norm_loudness: true,
                },
                parseAs: "arrayBuffer",
            });

            Sentry.logger.info("Generation started", {
                orgId: ctx.orgId,
                voiceId: input.voiceId,
                textLength: input.text.length,
            });

            if (error) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to generate audio",
                });
            }

            if (!(data instanceof ArrayBuffer)) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Invalid audio response",
                });
            }

            const buffer = Buffer.from(data);
            let generationId: string | null = null;
            let r2ObjectKey: string | null = null;

            try {
                // Step 1: persist metadata first so we have a stable id to
                // derive the storage key from.
                const generation = await prisma.generation.create({
                    data: {
                        orgId: ctx.orgId,
                        text: input.text,
                        voiceName: voice.name,
                        voiceId: voice.id,
                        temperature: input.temperature,
                        topP: input.topP,
                        topK: input.topK,
                        repetitionPenalty: input.repetitionPenalty,
                    },
                    select: {
                        id: true,
                    },
                });

                generationId = generation.id;
                r2ObjectKey = `generations/orgs/${ctx.orgId}/${generation.id}`;

                // Step 2: upload the WAV bytes to object storage.
                await uploadAudio({ buffer, key: r2ObjectKey });

                // Step 3: link the storage key onto the row now that the
                // upload succeeded.
                await prisma.generation.update({
                    where: {
                        id: generation.id,
                    },
                    data: {
                        r2ObjectKey,
                    },
                });

                Sentry.logger.info("Audio generated", {
                    orgId: ctx.orgId,
                    generationId: generation.id,
                });
            } catch {
                // Compensating action: remove the orphaned DB row if any step
                // after creation failed; ignore secondary delete errors.
                if (generationId) {
                    await prisma.generation
                        .delete({
                            where: {
                                id: generationId,
                            },
                        })
                        .catch(() => { });
                }

                Sentry.logger.error("Generation failed", {
                    orgId: ctx.orgId,
                    voiceId: input.voiceId,
                });

                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to store generated audio",
                });
            }

            if (!generationId || !r2ObjectKey) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to store generated audio",
                });
            }

            // Ingest usage event to Polar
            try {
                await polar.events.ingest({
                    events: [
                        {
                            name: env.POLAR_METER_TTS_GENERATION,
                            externalCustomerId: ctx.orgId,
                            metadata: { "characters": input.text.length },
                            timestamp: new Date(),
                        },
                    ],
                });
            } catch (err) {
                Sentry.captureException(err);
                console.error("Failed to ingest TTS usage event to Polar:", err);
                // Silently fail - don't break the user experience for metering errors
            }

            return {
                id: generationId,
            };
        }),
});