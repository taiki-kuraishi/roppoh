import { useUser } from "@roppoh/better-auth-query/query";
import { Dialog, DialogContent } from "@roppoh/shadcn/components/ui/dialog";
import { Skeleton } from "@roppoh/shadcn/components/ui/skeleton";
import { useQueryStates } from "nuqs";

import { dialogSearchParams } from "../../params";
import { Form } from "./components/form";

export const UpdateDialog = () => {
  const [{ user_id }, setParams] = useQueryStates(dialogSearchParams);
  const { data, isPending } = useUser({ user_id });

  const handleClose = () => void setParams({ user_id: null, dialog: null });

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        {isPending || !data ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Form user={data} />
        )}
      </DialogContent>
    </Dialog>
  );
};
