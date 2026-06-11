import { useQuery } from "@tanstack/react-query";

import { auth } from "@/libs/better-auth";

import { BetterAuthError, MissingQueryParameterError } from "../error";

export const USE_USER_KEY = "better-auth-use-user" as const;

interface Args {
  user_id: string | undefined | null;
}

export const useUser = (args: Args) => {
  const queryFn = async () => {
    if (!args.user_id) {
      throw new MissingQueryParameterError("user_id");
    }
    const { data, error } = await auth.admin.getUser({
      query: { id: args.user_id },
    });

    if (error) {
      console.log(error);
      throw new BetterAuthError(error);
    }

    return data;
  };

  return useQuery<Awaited<ReturnType<typeof queryFn>>, BetterAuthError>({
    enabled: Boolean(args.user_id),
    queryFn,
    queryKey: [USE_USER_KEY, args.user_id],
  });
};
