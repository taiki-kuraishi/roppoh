import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AuthClient } from "../types";

import { useAuthClient } from "../hooks";
import { LIST_USERS_KEY } from "../keys";
import { toError } from "../utils";

type Args = Parameters<NonNullable<AuthClient["admin"]["removeUser"]>>[0];

interface Options {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export const useRemoveUser = (opts: Options = {}) => {
  const authClient = useAuthClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: Args) => {
      const { data, error } = await authClient.admin.removeUser(args);

      if (error) {
        throw toError(error, "Failed to remove user");
      }

      return data;
    },
    onError: (error) => {
      console.error(error);
      opts.onError?.(error);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LIST_USERS_KEY });
      opts.onSuccess?.();
    },
  });
};
