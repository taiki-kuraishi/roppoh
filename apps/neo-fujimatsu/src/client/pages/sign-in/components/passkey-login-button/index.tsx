import { extractErrorMessage } from "@roppoh/better-auth-query";
import { Button } from "@roppoh/shadcn/components/ui/button";
import { Spinner } from "@roppoh/shadcn/components/ui/spinner";
import { Fingerprint } from "lucide-react";
import { useTransition } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

import { authClient } from "@/client/libs/better-auth";

import { resolveRedirectUrl } from "../../utils/resolve-redirect";

export function PasskeyLoginButton() {
  const [isPending, startTransition] = useTransition();
  const [searchParams] = useSearchParams();

  const signIn = () =>
    startTransition(async () => {
      const callbackURL = resolveRedirectUrl(searchParams);
      const res = await authClient.signIn.passkey();
      if (res?.error) {
        toast.error(extractErrorMessage(res.error.message) ?? "Failed to sign in with passkey");
        return;
      }
      globalThis.location.href = callbackURL;
    });

  return (
    <Button className="gap-3" disabled={isPending} onClick={signIn} type="button" variant="outline">
      {isPending ? <Spinner /> : <Fingerprint className="size-4" />}
      Sign in with Passkey
    </Button>
  );
}
