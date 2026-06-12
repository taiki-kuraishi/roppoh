import { useUserPasskeys } from "@roppoh/better-auth-query/query";
import { Dialog, DialogContent } from "@roppoh/shadcn/components/ui/dialog";
import { useQueryStates } from "nuqs";

import { dialogSearchParams } from "../../params";
import { Content } from "./components/content";

export const DeletePasskeyDialog = () => {
  const [{ passkey_id }, setParams] = useQueryStates(dialogSearchParams);
  const { data } = useUserPasskeys();
  const passkey = data?.find((entry) => entry.id === passkey_id);

  return (
    <Dialog open={true} onOpenChange={() => void setParams({ dialog: null, passkey_id: null })}>
      <DialogContent className="sm:max-w-sm">
        {passkey ? <Content passkey={passkey} /> : null}
      </DialogContent>
    </Dialog>
  );
};
