/**
 * -----------------------------------------------------------------------------
 * tRPC HTTP Endpoint
 * -----------------------------------------------------------------------------
 * The single API entry point for all tRPC procedures at `/api/trpc/*`. It
 * exists to bridge Next.js's fetch-based Route Handlers with tRPC's fetch
 * adapter: every client query/mutation (voices, generations, etc.) flows
 * through here, where `createTRPCContext` attaches the Clerk auth session and
 * Prisma/db clients to each request before the `appRouter` resolves it.
 * Both GET (queries) and POST (mutations) are handled by the same function.
 *
 * HTTP methods: GET and POST
 * Auth: none enforced here — each procedure declares its own protection via
 *   the tRPC middleware (public vs. protected) using the Clerk session in the
 *   request context.
 */
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createTRPCContext } from '../../../../trpc/init';
import { appRouter } from '../../../../trpc/routers/_app';

/**
 * Handles an incoming tRPC request by delegating to the fetch adapter, which
 * parses the procedure name/input from the URL/body, builds the context, and
 * dispatches to the matching appRouter procedure.
 *
 * @param req - The raw Request for a `/api/trpc/<procedure>` call.
 * @returns The procedure's JSON response (or a tRPC-formatted error).
 */
const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext: createTRPCContext,
    });

// Next.js route handlers must export named HTTP methods; both verbs share the
// same handler since tRPC distinguishes queries from mutations internally.
export { handler as GET, handler as POST };