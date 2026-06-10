import { useMutation } from "@tanstack/react-query";

import { auth } from "@/libs/better-auth";

import { BetterAuthError } from "../error";

type Params = Parameters<NonNullable<(typeof auth)["admin"]["impersonateUser"]>>[0];
type Data = NonNullable<
  Awaited<ReturnType<NonNullable<(typeof auth)["admin"]["impersonateUser"]>>>["data"]
>;

interface Args {
  onError?: (args: { error: Error; variables: Params }) => void | Promise<void>;
  onSuccess?: (args: { data: Data; variables: Params }) => void | Promise<void>;
}

export const useImpersonateUserMutation = (args: Args) => {
  const mutationFn = async (params: Params) => {
    const { data, error } = await auth.admin.impersonateUser(params);

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
    onSuccess: async (data, variables) => {
      await args.onSuccess?.({ data, variables });
    },
  });
};
