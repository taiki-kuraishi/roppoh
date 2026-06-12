import { useOidcClient } from "@roppoh/better-auth-query/query";
import { Dialog, DialogContent } from "@roppoh/shadcn/components/ui/dialog";
import { Skeleton } from "@roppoh/shadcn/components/ui/skeleton";
import { useQueryStates } from "nuqs";

import { dialogSearchParams } from "../../params";
import { Content } from "./components/content";

export const DeleteClientDialog = () => {
  const [{ client_id }, setParams] = useQueryStates(dialogSearchParams);

  const { data, isPending } = useOidcClient({ client_id });

  return (
    <Dialog open={true} onOpenChange={() => void setParams({ client_id: null, dialog: null })}>
      <DialogContent className="sm:max-w-sm">
        {isPending || !data ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <Content client={data} />
        )}
      </DialogContent>
    </Dialog>
  );
};
