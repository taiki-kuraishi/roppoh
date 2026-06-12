import { useQuery } from "@tanstack/react-query";

import { useAuthClient } from "../hooks";
import { GET_USER_KEY } from "../keys";
import { toError } from "../utils";

interface Args {
  user_id: string | undefined | null;
}

export const useUser = (args: Args) => {
  const authClient = useAuthClient();

  return useQuery({
    enabled: Boolean(args.user_id),
    queryFn: async () => {
      if (!args.user_id) {
        throw new Error("Required query parameter 'user_id' is missing");
      }

      const { data, error } = await authClient.admin.getUser({
        query: { id: args.user_id },
      });

      if (error) {
        throw toError(error, "Failed to get user");
      }

      return data;
    },
    queryKey: [...GET_USER_KEY, args.user_id],
  });
};
