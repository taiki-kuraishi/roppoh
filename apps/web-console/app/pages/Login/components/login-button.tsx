import { useAuth } from "@roppoh/oidc-client";
import { Button } from "@roppoh/shadcn/components/ui/button";
import { Spinner } from "@roppoh/shadcn/components/ui/spinner";
import { useTransition } from "react";

export function LoginButton() {
  const [isPending, startTransition] = useTransition();
  const auth = useAuth();

  const signIn = () => startTransition(async () => await auth.signinRedirect());

  return (
    <Button className="w-full" disabled={isPending} onClick={signIn} type="button">
      {isPending && <Spinner />}
      Sign in
    </Button>
  );
}
