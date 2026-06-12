import { useUserSessions } from "@roppoh/better-auth-query/query";
import { Dialog, DialogContent } from "@roppoh/shadcn/components/ui/dialog";
import { Skeleton } from "@roppoh/shadcn/components/ui/skeleton";
import { useQueryStates } from "nuqs";

import { dialogSearchParams } from "../../params";
import { Content } from "./components/content";

export const SessionsDialog = () => {
  const [{ user_id }, setParams] = useQueryStates(dialogSearchParams);
  const { data, isPending } = useUserSessions({ user_id });

  const handleClose = () => void setParams({ user_id: null, dialog: null });

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {isPending || !data || !user_id ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <Content userId={user_id} sessions={data.sessions} />
        )}
      </DialogContent>
    </Dialog>
  );
};
