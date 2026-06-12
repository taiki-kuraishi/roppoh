import { useUserPasskeys } from "@roppoh/better-auth-query/query";
import { Button } from "@roppoh/shadcn/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@roppoh/shadcn/components/ui/card";
import { ItemGroup } from "@roppoh/shadcn/components/ui/item";
import { Plus } from "lucide-react";
import { useQueryStates } from "nuqs";
import { Suspense, lazy } from "react";

import { PasskeyListView } from "./components/passkey-list-view";
import { dialogSearchParams } from "./params";

const AddPasskeyDialog = lazy(async () =>
  import("./components/add-passkey-dialog").then((m) => ({ default: m.AddPasskeyDialog })),
);
const DeletePasskeyDialog = lazy(async () =>
  import("./components/delete-passkey-dialog").then((m) => ({ default: m.DeletePasskeyDialog })),
);

export default function () {
  const { data, isPending } = useUserPasskeys();
  const [{ dialog, passkey_id }, setParams] = useQueryStates(dialogSearchParams);

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Account</h1>

      <Card>
        <CardHeader>
          <CardTitle>Passkeys</CardTitle>
          <CardDescription>
            Sign in securely without a password using your device&apos;s biometrics or a security
            key.
          </CardDescription>
          <CardAction>
            <Button
              variant="outline"
              onClick={() => void setParams({ dialog: "add", passkey_id: null })}
            >
              <Plus />
              Add passkey
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ItemGroup>
            <PasskeyListView isPending={isPending} data={data} />
          </ItemGroup>
        </CardContent>
      </Card>

      {dialog === "add" && (
        <Suspense fallback={null}>
          <AddPasskeyDialog />
        </Suspense>
      )}
      {dialog === "delete" && passkey_id && (
        <Suspense fallback={null}>
          <DeletePasskeyDialog />
        </Suspense>
      )}
    </div>
  );
}
