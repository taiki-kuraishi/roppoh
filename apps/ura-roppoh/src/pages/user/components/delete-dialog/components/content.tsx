import type { useUser } from "@roppoh/better-auth-query/query";

import { useRemoveUser } from "@roppoh/better-auth-query/mutation";
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

import { dialogSearchParams } from "@/pages/user/params";

interface Props {
  user: NonNullable<ReturnType<typeof useUser>["data"]>;
}

export const Content = (props: Props) => {
  const [, setParams] = useQueryStates(dialogSearchParams);

  const { mutateAsync, isPending } = useRemoveUser({
    onError: () => void toast.error("Failed to delete user."),
    onSuccess: () => {
      toast.success("User deleted.");
      void setParams({ user_id: null, dialog: null });
    },
  });

  const handleDelete = async () => await mutateAsync({ userId: props.user.id });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Delete User</DialogTitle>
        <DialogDescription>
          &quot;{props.user.name}&quot; ({props.user.email}) will be permanently deleted. This
          action cannot be undone.
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
