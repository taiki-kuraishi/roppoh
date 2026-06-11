import { useQuery } from "@tanstack/react-query";

import { auth } from "@/libs/better-auth";

import { BetterAuthError } from "../error";

export const USE_USERS_KEY = "better-auth-use-users" as const;

export const useUsers = () => {
  const queryFn = async () => {
    const { data, error } = await auth.admin.listUsers({ query: {} });

    if (error) {
      console.log(error);
      throw new BetterAuthError(error);
    }

    return data;
  };

  return useQuery<Awaited<ReturnType<typeof queryFn>>, BetterAuthError>({
    queryFn,
    queryKey: [USE_USERS_KEY],
  });
};
