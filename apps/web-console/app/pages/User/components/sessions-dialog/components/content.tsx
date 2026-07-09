import type { useUserSessions } from "@roppoh/better-auth-query/query";

import { useRevokeUserSessions } from "@roppoh/better-auth-query/mutation";
import { Button } from "@roppoh/shadcn/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@roppoh/shadcn/components/ui/dialog";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@roppoh/shadcn/components/ui/item";
import { Spinner } from "@roppoh/shadcn/components/ui/spinner";
import { useQueryStates } from "nuqs";
import { toast } from "sonner";

import { dialogSearchParams } from "@/pages/User/params";

type Sessions = NonNullable<ReturnType<typeof useUserSessions>["data"]>["sessions"];

interface Props {
  userId: string;
  sessions: Sessions;
}

export const Content = (props: Props) => {
  const [, setParams] = useQueryStates(dialogSearchParams);

  const { mutateAsync, isPending } = useRevokeUserSessions({
    onError: () => void toast.error("Failed to revoke sessions."),
    onSuccess: () => {
      toast.success("All sessions revoked.");
      void setParams({ user_id: null, dialog: null });
    },
  });

  const handleRevokeAll = async () => await mutateAsync({ userId: props.userId });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Manage Sessions</DialogTitle>
        <DialogDescription>{props.sessions.length} active session(s)</DialogDescription>
      </DialogHeader>

      <div className="max-h-[60vh] overflow-y-auto py-4">
        {props.sessions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No active sessions.</p>
        ) : (
          <ItemGroup>
            {props.sessions.map((session) => (
              <Item key={session.id} variant="muted">
                <ItemContent>
                  <ItemTitle>{session.ipAddress || "Unknown IP"}</ItemTitle>
                  <ItemDescription className="break-all">
                    {session.userAgent || "Unknown device"}
                  </ItemDescription>
                  <ItemDescription className="text-xs">
                    Expires: {new Date(session.expiresAt).toISOString()}
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        )}
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline">Close</Button>} />
        <Button
          variant="destructive"
          onClick={handleRevokeAll}
          disabled={isPending || props.sessions.length === 0}
        >
          {isPending ? <Spinner /> : "Revoke all sessions"}
        </Button>
      </DialogFooter>
    </>
  );
};
