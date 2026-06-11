import { Dialog, DialogContent } from "@roppoh/shadcn/components/ui/dialog";
import { Skeleton } from "@roppoh/shadcn/components/ui/skeleton";
import { useQueryStates } from "nuqs";

import { useUser } from "@/hooks/better-auth";

import { dialogSearchParams } from "../../params";
import { Content } from "./components/content";

export const ImpersonateDialog = () => {
  const [{ user_id }, setParams] = useQueryStates(dialogSearchParams);
  const { data, isPending } = useUser({ user_id });

  const handleClose = () => void setParams({ user_id: null, dialog: null });

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        {isPending || !data ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <Content user={data} />
        )}
      </DialogContent>
    </Dialog>
  );
};
