import { useQuery } from "@tanstack/react-query";

import { useAuthClient } from "../hooks";
import { LIST_USER_SESSIONS_KEY } from "../keys";
import { toError } from "../utils";

interface Args {
  user_id: string | undefined | null;
}

export const useUserSessions = (args: Args) => {
  const authClient = useAuthClient();

  return useQuery({
    enabled: Boolean(args.user_id),
    queryFn: async () => {
      if (!args.user_id) {
        throw new Error("Required query parameter 'user_id' is missing");
      }

      const { data, error } = await authClient.admin.listUserSessions({
        userId: args.user_id,
      });

      if (error) {
        throw toError(error, "Failed to list user sessions");
      }

      return data;
    },
    queryKey: [...LIST_USER_SESSIONS_KEY, args.user_id],
  });
};
