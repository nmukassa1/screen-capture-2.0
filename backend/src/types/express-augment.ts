/**
 * Loaded from `index.ts` so ts-node includes this in the program (ambient `.d.ts`
 * files under `src/types/` are not always pulled in when compiling the import graph).
 */
export {};

declare global {
  namespace Express {
    interface Request {
      /** Set by `authenticate` after Supabase JWT validation. */
      authUser?: { id: string; email?: string | null };
    }
  }
}
