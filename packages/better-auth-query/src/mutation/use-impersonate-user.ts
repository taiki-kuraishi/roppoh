import { useMutation } from "@tanstack/react-query";

import type { AuthClient } from "../types";

import { useAuthClient } from "../hooks";
import { toError } from "../utils";

type Args = Parameters<NonNullable<AuthClient["admin"]["impersonateUser"]>>[0];
type Data = NonNullable<
  Awaited<ReturnType<NonNullable<AuthClient["admin"]["impersonateUser"]>>>["data"]
>;

interface Options {
  onError?: (error: Error) => void;
  onSuccess?: (data: Data) => void;
}

export const useImpersonateUser = (opts: Options = {}) => {
  const authClient = useAuthClient();

  return useMutation({
    mutationFn: async (args: Args) => {
      const { data, error } = await authClient.admin.impersonateUser(args);

      if (error) {
        throw toError(error, "Failed to impersonate user");
      }

      return data;
    },
    onError: (error) => {
      console.error(error);
      opts.onError?.(error);
    },
    onSuccess: (data) => {
      opts.onSuccess?.(data);
    },
  });
};
