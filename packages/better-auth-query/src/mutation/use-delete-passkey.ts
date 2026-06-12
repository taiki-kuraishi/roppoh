import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AuthClient } from "../types";

import { useAuthClient } from "../hooks";
import { LIST_USER_PASSKEYS_KEY } from "../keys";
import { toError } from "../utils";

type Args = Parameters<NonNullable<AuthClient["passkey"]["deletePasskey"]>>[0];

interface Options {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export const useDeletePasskey = (opts: Options = {}) => {
  const authClient = useAuthClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: Args) => {
      const { data, error } = await authClient.passkey.deletePasskey(args);

      if (error) {
        throw toError(error, "Failed to delete passkey");
      }

      return data;
    },
    onError: (error) => {
      console.error(error);
      opts.onError?.(error);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LIST_USER_PASSKEYS_KEY });
      opts.onSuccess?.();
    },
  });
};
