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

import { type useUser, useImpersonateUserMutation } from "@/hooks/better-auth";
import { dialogSearchParams } from "@/pages/user/params";

interface Props {
  user: NonNullable<ReturnType<typeof useUser>["data"]>;
}

export const Content = (props: Props) => {
  const [, setParams] = useQueryStates(dialogSearchParams);

  const { mutateAsync, isPending } = useImpersonateUserMutation({
    onError: () => void toast.error("Failed to impersonate user."),
    onSuccess: ({ data }) => {
      toast.success(`Now impersonating ${data.user.name}.`);
      void setParams({ user_id: null, dialog: null });
    },
  });

  const handleImpersonate = async () => await mutateAsync({ userId: props.user.id });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Impersonate User</DialogTitle>
        <DialogDescription>
          You will start a session as {props.user.name} ({props.user.email}). Use &quot;stop
          impersonating&quot; to return to your own session.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <Button onClick={handleImpersonate} disabled={isPending}>
          {isPending ? <Spinner /> : "Impersonate"}
        </Button>
      </DialogFooter>
    </>
  );
};
