import { useMutation } from "@tanstack/react-query";

import type { AuthClient } from "../types";

import { useAuthClient } from "../hooks";
import { toError } from "../utils";

type Args = Parameters<NonNullable<AuthClient["admin"]["setUserPassword"]>>[0];

interface Options {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export const useSetUserPassword = (opts: Options = {}) => {
  const authClient = useAuthClient();

  return useMutation({
    mutationFn: async (args: Args) => {
      const { data, error } = await authClient.admin.setUserPassword(args);

      if (error) {
        throw toError(error, "Failed to set user password");
      }

      return data;
    },
    onError: (error) => {
      console.error(error);
      opts.onError?.(error);
    },
    onSuccess: () => {
      opts.onSuccess?.();
    },
  });
};
