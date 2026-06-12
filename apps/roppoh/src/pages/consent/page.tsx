import { useOidcClient } from "@roppoh/better-auth-query/query";
import { Button } from "@roppoh/shadcn/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@roppoh/shadcn/components/ui/card";
import { GalleryVerticalEnd } from "lucide-react";
import { useSearchParams } from "react-router";

import { auth } from "@/libs/better-auth";

export default function () {
  const [searchParams] = useSearchParams();
  const client_id = searchParams.get("client_id");
  const scope = searchParams.get("scope") ?? "";
  const scopes = scope.split(" ").filter(Boolean);

  const { data: clientData, isPending } = useOidcClient({ client_id });

  const handleConsent = async (accept: boolean) => {
    const { data } = await auth.oauth2.consent({ accept });
    if (data?.redirect && data?.url) {
      globalThis.location.href = data.url;
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a
          className="flex items-center gap-2 self-center font-medium"
          href="https://github.com/tsar-org"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Roppoh
        </a>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {isPending ? "Loading..." : (clientData?.client_name ?? client_id)}
            </CardTitle>
            <CardDescription>
              This application is requesting access to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scopes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Requested permissions:</p>
                <ul className="space-y-1">
                  {scopes.map((s) => (
                    <li key={s} className="text-sm text-muted-foreground">
                      • {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => void handleConsent(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => void handleConsent(true)}>
              Authorize
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
