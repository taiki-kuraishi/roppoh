import type { useOidcClient } from "@roppoh/better-auth-query/query";

import { useDeleteOidcClient } from "@roppoh/better-auth-query/mutation";
import { Button } from "@roppoh/shadcn/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@roppoh/shadcn/components/ui/dialog";
import { Spinner } from "@roppoh/shadcn/components/ui/spinner";
import { useQueryStates } from "nuqs";
import { toast } from "sonner";

import { dialogSearchParams } from "@/pages/oidc-client/params";

interface Props {
  client: NonNullable<ReturnType<typeof useOidcClient>["data"]>;
}

export const Content = (props: Props) => {
  const [, setParams] = useQueryStates(dialogSearchParams);

  const { mutateAsync, isPending } = useDeleteOidcClient({
    onError: () => void toast.error("Failed delete OIDC client mutation."),
    onSuccess: () => void setParams({ client_id: null, dialog: null }),
  });

  const handleDelete = async () => await mutateAsync({ client_id: props.client.client_id });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Delete OIDC Client</DialogTitle>
        <DialogDescription>
          {props.client.client_name
            ? `"${props.client.client_name}" (${props.client.client_id})`
            : props.client.client_id}{" "}
          will be permanently deleted. This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
          {isPending ? <Spinner /> : "Delete"}
        </Button>
      </DialogFooter>
    </>
  );
};
