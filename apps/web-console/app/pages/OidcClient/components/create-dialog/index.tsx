import { Dialog, DialogContent } from "@roppoh/shadcn/components/ui/dialog";
import { useQueryStates } from "nuqs";
import { useState } from "react";

import { dialogSearchParams } from "@/pages/OidcClient/params";

import { Form } from "./components/form";
import { SecretView } from "./components/secret-view";

export const CreateClientDialog = () => {
  const [, setParams] = useQueryStates(dialogSearchParams);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const handleClose = () => void setParams({ client_id: null, dialog: null });

  if (createdSecret) {
    return (
      <Dialog open={true} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-sm">
          <SecretView clientSecret={createdSecret} onDone={handleClose} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <Form
          onSuccess={(data) => {
            if (data.client_secret) {
              setCreatedSecret(data.client_secret);
              return;
            }
            handleClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
