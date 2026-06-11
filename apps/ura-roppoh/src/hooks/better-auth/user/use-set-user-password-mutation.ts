import { useMutation } from "@tanstack/react-query";

import { auth } from "@/libs/better-auth";

import { BetterAuthError } from "../error";

type Params = Parameters<NonNullable<(typeof auth)["admin"]["setUserPassword"]>>[0];

interface Args {
  onError?: (args: { error: Error; variables: Params }) => void | Promise<void>;
  onSuccess?: (args: { variables: Params }) => void | Promise<void>;
}

export const useSetUserPasswordMutation = (args: Args) => {
  const mutationFn = async (params: Params) => {
    const { data, error } = await auth.admin.setUserPassword(params);

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
      await args.onSuccess?.({ variables });
    },
  });
};
