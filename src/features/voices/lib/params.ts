/**
 * -----------------------------------------------------------------------------
 * Voices URL search-param schemas
 * -----------------------------------------------------------------------------
 * Defines the typed URL search params that drive the Voices page state via
 * nuqs. `query` holds the voice search filter and `cloning` controls whether
 * the custom-voice creation dialog is open. Keeping this state in the URL
 * means the dialog and search survive refreshes and can be shared as links.
 *
 * `voicesSearchParams` is shared by both client consumers (`useQueryState` in
 * voices-view.tsx / voices-toolbar.tsx) and the server-side cache below,
 * guaranteeing identical parsing/validation on both sides of the boundary.
 */
import { createSearchParamsCache, parseAsBoolean, parseAsString } from "nuqs/server";

/**
 * Search param parsers for the Voices page.
 * - `query`: free-text search term used by `trpc.voices.getAll` to filter
 *   voices server-side; defaults to an empty string (no filtering).
 * - `cloning`: boolean flag that opens/closes the VoiceCreateDialog;
 *   defaults to false so the dialog is closed on a clean URL.
 */
export const voicesSearchParams = {
    query: parseAsString.withDefault(""),
    cloning: parseAsBoolean.withDefault(false),
};

/**
 * Server-safe cache for the voices search params.
 *
 * @returns A parser that reads and validates the current URL search params on
 * the server (e.g. inside a Server Component or before hydration), so layout
 * code can access them with type safety before any client hooks run.
 */
export const voicesSearchParamsCache =
    createSearchParamsCache(voicesSearchParams);