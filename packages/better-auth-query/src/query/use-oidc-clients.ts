import { useQuery } from "@tanstack/react-query";

import { useAuthClient } from "../hooks";
import { GET_OIDC_CLIENTS_KEY } from "../keys";
import { toError } from "../utils";

export const useOidcClients = () => {
  const authClient = useAuthClient();

  return useQuery({
    queryFn: async () => {
      const { data, error } = await authClient.oauth2.getClients();

      if (error) {
        throw toError(error, "Failed to get OIDC clients");
      }

      return data;
    },
    queryKey: GET_OIDC_CLIENTS_KEY,
  });
};
