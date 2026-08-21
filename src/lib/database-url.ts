/**
 * -----------------------------------------------------------------------------
 * PostgreSQL connection-string normalizer
 * -----------------------------------------------------------------------------
 * Small utility that upgrades lenient `sslmode` values in DATABASE_URL to
 * `verify-full`. It exists because managed Postgres providers commonly hand
 * out URLs with `sslmode=require`/`prefer`, which encrypt but do not verify
 * the server certificate — while Prisma's pg adapter defaults to strict
 * certificate verification. Normalizing up front avoids confusing handshake
 * failures and enforces a consistent, secure TLS posture.
 *
 * Consumed only by `db.ts` when constructing the PrismaPg adapter.
 */

// sslmode values that are weaker than full certificate verification.
const SSL_MODE_ALIASES = new Set(["prefer", "require", "verify-ca"]);

/**
 * Rewrites a database URL's sslmode to `verify-full` when it is too lenient.
 *
 * @param databaseUrl - Raw connection string (may be undefined or non-URL).
 * @returns The normalized URL, or the input unchanged if no upgrade applies
 *   (missing value, unparseable URL, opt-out via `uselibpqcompat=true`,
 *   already-strict sslmode such as `verify-full`/`disable`).
 */
export function normalizeDatabaseUrl(databaseUrl: string | undefined): string | undefined {
  if (!databaseUrl) {
    return databaseUrl;
  }

  let url: URL;

  // If it isn't a valid URL, return as-is and let the driver surface the error.
  try {
    url = new URL(databaseUrl);
  } catch {
    return databaseUrl;
  }

  const sslMode = url.searchParams.get("sslmode");
  const useLibpqCompat = url.searchParams.get("uselibpqcompat");

  // Respect explicit opt-outs and modes we don't need to strengthen.
  if (!sslMode || useLibpqCompat === "true" || !SSL_MODE_ALIASES.has(sslMode)) {
    return databaseUrl;
  }

  // Upgrade to full certificate + hostname verification.
  url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}
