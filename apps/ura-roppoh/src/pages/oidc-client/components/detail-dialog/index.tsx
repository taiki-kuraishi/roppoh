import { useOidcClient } from "@roppoh/better-auth-query/query";
import { Dialog, DialogContent } from "@roppoh/shadcn/components/ui/dialog";
import { Skeleton } from "@roppoh/shadcn/components/ui/skeleton";
import { useQueryStates } from "nuqs";

import { dialogSearchParams } from "../../params";
import { Content } from "./components/content";

export const DetailDialog = () => {
  const [{ client_id }, setParams] = useQueryStates(dialogSearchParams);
  const { data, isPending } = useOidcClient({ client_id });

  const handleClose = () => void setParams({ client_id: null, dialog: null });

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {isPending || !data ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <Content client={data} />
        )}
      </DialogContent>
    </Dialog>
  );
};
