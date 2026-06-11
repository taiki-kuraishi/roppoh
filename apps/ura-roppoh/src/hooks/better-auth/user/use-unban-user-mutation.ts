import { useMutation, useQueryClient } from "@tanstack/react-query";

import { auth } from "@/libs/better-auth";

import { BetterAuthError } from "../error";
import { USE_USER_KEY } from "./use-user";
import { USE_USERS_KEY } from "./use-users";

type Params = Parameters<NonNullable<(typeof auth)["admin"]["unbanUser"]>>[0];

interface Args {
  onError?: (args: { error: Error; variables: Params }) => void | Promise<void>;
  onSuccess?: (args: { variables: Params }) => void | Promise<void>;
}

export const useUnbanUserMutation = (args: Args) => {
  const query = useQueryClient();

  const mutationFn = async (params: Params) => {
    const { data, error } = await auth.admin.unbanUser(params);

    if (error) {
      console.log(error);
      throw new BetterAuthError(error);
    }

    return data;
  };

  return useMutation({
    mutationFn,
    onError: async (error, variables, onMutateResult, context) => {
      console.error({ context, error, onMutateResult, variables });
      await args.onError?.({ error, variables });
    },
    onSuccess: async (_data, variables) => {
      await query.invalidateQueries({ queryKey: [USE_USERS_KEY] });
      await query.invalidateQueries({ queryKey: [USE_USER_KEY] });
      await args.onSuccess?.({ variables });
    },
  });
};
