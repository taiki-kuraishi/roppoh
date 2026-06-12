import { useQuery } from "@tanstack/react-query";

import { useAuthClient } from "../hooks";
import { GET_OIDC_CLIENT_KEY } from "../keys";
import { toError } from "../utils";

interface Args {
  client_id: string | undefined | null;
}

export const useOidcClient = (args: Args) => {
  const authClient = useAuthClient();

  return useQuery({
    enabled: Boolean(args.client_id),
    queryFn: async () => {
      if (!args.client_id) {
        throw new Error("Required query parameter 'client_id' is missing");
      }

      const { data, error } = await authClient.oauth2.getClient({
        query: { client_id: args.client_id },
      });

      if (error) {
        throw toError(error, "Failed to get OIDC client");
      }

      return data;
    },
    queryKey: [...GET_OIDC_CLIENT_KEY, args.client_id],
  });
};
