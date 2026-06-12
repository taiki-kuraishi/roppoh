import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AuthClient } from "../types";

import { useAuthClient } from "../hooks";
import { GET_USER_KEY, LIST_USERS_KEY } from "../keys";
import { toError } from "../utils";

type Args = Parameters<NonNullable<AuthClient["admin"]["setRole"]>>[0];

interface Options {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export const useSetUserRole = (opts: Options = {}) => {
  const authClient = useAuthClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: Args) => {
      const { data, error } = await authClient.admin.setRole(args);

      if (error) {
        throw toError(error, "Failed to set user role");
      }

      return data;
    },
    onError: (error) => {
      console.error(error);
      opts.onError?.(error);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LIST_USERS_KEY });
      await queryClient.invalidateQueries({ queryKey: GET_USER_KEY });
      opts.onSuccess?.();
    },
  });
};
