import type { useUser } from "@roppoh/better-auth-query/query";

import { useBanUser, useUnbanUser } from "@roppoh/better-auth-query/mutation";
import { Button } from "@roppoh/shadcn/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@roppoh/shadcn/components/ui/dialog";
import { Field, FieldGroup } from "@roppoh/shadcn/components/ui/field";
import { Input } from "@roppoh/shadcn/components/ui/input";
import { Label } from "@roppoh/shadcn/components/ui/label";
import { Spinner } from "@roppoh/shadcn/components/ui/spinner";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

import { dialogSearchParams } from "@/pages/user/params";

const SECONDS_PER_DAY = 60 * 60 * 24;

type User = NonNullable<ReturnType<typeof useUser>["data"]>;

interface Props {
  user: User;
}

const UnbanContent = (props: Props) => {
  const [, setParams] = useQueryStates(dialogSearchParams);

  const { mutateAsync, isPending } = useUnbanUser({
    onError: () => void toast.error("Failed to unban user."),
    onSuccess: () => {
      toast.success("User unbanned.");
      void setParams({ user_id: null, dialog: null });
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Unban User</DialogTitle>
        <DialogDescription>
          {props.user.name} ({props.user.email}) will be unbanned and able to sign in again.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <Button onClick={() => void mutateAsync({ userId: props.user.id })} disabled={isPending}>
          {isPending ? <Spinner /> : "Unban"}
        </Button>
      </DialogFooter>
    </>
  );
};

const BanContent = (props: Props) => {
  const [, setParams] = useQueryStates(dialogSearchParams);
  const [reason, setReason] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");

  const { mutateAsync, isPending } = useBanUser({
    onError: () => void toast.error("Failed to ban user."),
    onSuccess: () => {
      toast.success("User banned.");
      void setParams({ user_id: null, dialog: null });
    },
  });

  const days = Number(expiresInDays);
  const handleBan = async () =>
    await mutateAsync({
      userId: props.user.id,
      banReason: reason || undefined,
      banExpiresIn: expiresInDays && days > 0 ? days * SECONDS_PER_DAY : undefined,
    });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Ban User</DialogTitle>
        <DialogDescription>
          {props.user.name} ({props.user.email})
        </DialogDescription>
      </DialogHeader>

      <FieldGroup className="py-6">
        <Field>
          <Label htmlFor="ban-reason">Ban Reason</Label>
          <Input
            id="ban-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional"
          />
        </Field>
        <Field>
          <Label htmlFor="ban-expires">Ban Duration (days)</Label>
          <Input
            id="ban-expires"
            type="number"
            min={0}
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(e.target.value)}
            placeholder="Leave empty for permanent ban"
          />
        </Field>
      </FieldGroup>

      <DialogFooter>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <Button variant="destructive" onClick={handleBan} disabled={isPending}>
          {isPending ? <Spinner /> : "Ban"}
        </Button>
      </DialogFooter>
    </>
  );
};

export const Content = (props: Props) => {
  if (props.user.banned === true) {
    return <UnbanContent user={props.user} />;
  }
  return <BanContent user={props.user} />;
};
