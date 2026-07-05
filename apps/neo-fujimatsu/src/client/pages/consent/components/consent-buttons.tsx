"use client";

import { Button } from "@roppoh/shadcn/components/ui/button";
import { CardFooter } from "@roppoh/shadcn/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { authClient } from "@/client/libs/better-auth";

export function ConsentBtns() {
  const [isPending, startTransition] = useTransition();

  return (
    <CardFooter className="flex items-center gap-2">
      <Button
        onClick={() => {
          startTransition(async () => {
            const res = await authClient.oauth2.consent({
              accept: true,
            });

            if (res.data?.redirect && res.data.url) {
              globalThis.location.href = res.data.url;
              return;
            }
            toast.error("Failed to authorize");
          });
        }}
      >
        {isPending ? <Loader2 size={15} className="animate-spin" /> : "Authorize"}
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          startTransition(async () => {
            const res = await authClient.oauth2.consent({
              accept: false,
            });
            if (res.data?.redirect && res.data.url) {
              globalThis.location.href = res.data.url;
              return;
            }
            toast.error("Failed to cancel");
          });
        }}
      >
        Cancel
      </Button>
    </CardFooter>
  );
}
