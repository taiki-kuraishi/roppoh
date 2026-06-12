import { useDeletePasskey } from "@roppoh/better-auth-query/mutation";
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

import { dialogSearchParams } from "@/client/pages/account/params";

interface Props {
  passkey: { id: string; name?: string | null | undefined };
}

export const Content = (props: Props) => {
  const [, setParams] = useQueryStates(dialogSearchParams);

  const { mutateAsync, isPending } = useDeletePasskey({
    onError: (error) => void toast.error(error.message || "Failed to delete passkey"),
    onSuccess: () => {
      toast.success("Passkey deleted");
      void setParams({ dialog: null, passkey_id: null });
    },
  });

  const handleDelete = async () => await mutateAsync({ id: props.passkey.id });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Delete passkey</DialogTitle>
        <DialogDescription>
          {props.passkey.name ? `"${props.passkey.name}"` : props.passkey.id} will be permanently
          removed. You will not be able to sign in with this passkey again.
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
