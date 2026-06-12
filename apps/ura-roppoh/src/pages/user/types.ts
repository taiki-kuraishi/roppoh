import type { useUsers } from "@roppoh/better-auth-query/infinite";

export type User = NonNullable<
  ReturnType<typeof useUsers>["data"]
>["pages"][number]["users"][number];
