import type { useUsers } from "@/hooks/better-auth";

export type User = NonNullable<ReturnType<typeof useUsers>["data"]>["users"][number];
