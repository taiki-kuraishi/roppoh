import { QueryClient } from "@tanstack/react-query";

// Module-level singleton so the cache survives re-renders (instantiating a
// New QueryClient() inside the render body would discard it every render).
export const queryClient = new QueryClient();
