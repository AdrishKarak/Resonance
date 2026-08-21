/**
 * -----------------------------------------------------------------------------
 * Canonical system voice names
 * -----------------------------------------------------------------------------
 * The exact set of built-in ("system") voices shipped with Sonic. These names
 * act as the canonical registry distinguishing platform-provided voices from
 * user-created custom ones. `scripts/seed-system-voices.ts` iterates this list
 * to seed the database, and the voices tRPC router relies on the resulting
 * `variant: SYSTEM` rows to split results into the "Built-in Voices" vs
 * "Team Voices" sections rendered by voices-view.tsx.
 *
 * Declared `as const` so each name is a literal type, giving consumers
 * exhaustive, typo-safe access to the system voice catalog.
 */
export const CANONICAL_SYSTEM_VOICE_NAMES = [
    "Aaron",
    "Abigail",
    "Anaya",
    "Andy",
    "Archer",
    "Brian",
    "Chloe",
    "Dylan",
    "Emmanuel",
    "Ethan",
    "Evelyn",
    "Gavin",
    "Gordon",
    "Ivan",
    "Laura",
    "Lucy",
    "Madison",
    "Marisol",
    "Meera",
    "Walter",
] as const;