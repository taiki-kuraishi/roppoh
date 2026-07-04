import { QueryClient } from "@tanstack/react-query";

// Module-level singleton — fixes apps/ura-roppoh's root/index.tsx bug of
// Instantiating `new QueryClient()` inside the render body (discarding the
// Cache on every render).
export const queryClient = new QueryClient();
