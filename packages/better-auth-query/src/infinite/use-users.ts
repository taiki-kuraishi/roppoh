import { useInfiniteQuery } from "@tanstack/react-query";

import type { AuthClient } from "../types";

import { useAuthClient } from "../hooks";
import { LIST_USERS_KEY } from "../keys";
import { toError } from "../utils";

type ListUsersQuery = NonNullable<
  NonNullable<Parameters<NonNullable<AuthClient["admin"]["listUsers"]>>[0]>["query"]
>;

interface Args extends Omit<ListUsersQuery, "limit" | "offset"> {
  size: number;
}

export const useUsers = (args: Args) => {
  const authClient = useAuthClient();

  return useInfiniteQuery({
    queryKey: [...LIST_USERS_KEY, args],
    queryFn: async ({ pageParam }) => {
      const { size, ...rest } = args;
      const { data, error } = await authClient.admin.listUsers({
        query: { ...rest, limit: size, offset: pageParam * size },
      });

      if (error) {
        throw toError(error, "Failed to list users");
      }

      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.length * args.size;
      return fetched < lastPage.total ? allPages.length : undefined;
    },
  });
};
