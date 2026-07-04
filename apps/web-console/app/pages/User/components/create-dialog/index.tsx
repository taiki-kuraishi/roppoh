import { Dialog, DialogContent } from "@roppoh/shadcn/components/ui/dialog";
import { useQueryStates } from "nuqs";

import { dialogSearchParams } from "@/pages/User/params";

import { Form } from "./components/form";

export const CreateUserDialog = () => {
  const [, setParams] = useQueryStates(dialogSearchParams);

  const handleClose = () => void setParams({ user_id: null, dialog: null });

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <Form />
      </DialogContent>
    </Dialog>
  );
};
