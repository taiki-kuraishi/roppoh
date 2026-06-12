import { useQuery } from "@tanstack/react-query";

import { useAuthClient } from "../hooks";
import { LIST_USER_PASSKEYS_KEY } from "../keys";
import { toError } from "../utils";

export const useUserPasskeys = () => {
  const authClient = useAuthClient();

  return useQuery({
    queryFn: async () => {
      const { data, error } = await authClient.passkey.listUserPasskeys();

      if (error) {
        throw toError(error, "Failed to list user passkeys");
      }

      return data;
    },
    queryKey: LIST_USER_PASSKEYS_KEY,
  });
};
