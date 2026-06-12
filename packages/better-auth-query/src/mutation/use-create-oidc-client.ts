import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AuthClient } from "../types";

import { useAuthClient } from "../hooks";
import { GET_OIDC_CLIENTS_KEY } from "../keys";
import { toError } from "../utils";

type Args = Parameters<NonNullable<AuthClient["oauth2"]["createClient"]>>[0];
type Data = NonNullable<
  Awaited<ReturnType<NonNullable<AuthClient["oauth2"]["createClient"]>>>["data"]
>;

interface Options {
  onError?: (error: Error) => void;
  onSuccess?: (data: Data) => void;
}

export const useCreateOidcClient = (opts: Options = {}) => {
  const authClient = useAuthClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: Args) => {
      const { data, error } = await authClient.oauth2.createClient(args);

      if (error) {
        throw toError(error, "Failed to create OIDC client");
      }

      return data;
    },
    onError: (error) => {
      console.error(error);
      opts.onError?.(error);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: GET_OIDC_CLIENTS_KEY });
      opts.onSuccess?.(data);
    },
  });
};
