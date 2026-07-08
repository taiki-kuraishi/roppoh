import { useOidcClients } from "@roppoh/better-auth-query/query";
import { Button } from "@roppoh/shadcn/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@roppoh/shadcn/components/ui/input-group";
import { ItemGroup } from "@roppoh/shadcn/components/ui/item";
import { Skeleton } from "@roppoh/shadcn/components/ui/skeleton";
import { Search } from "lucide-react";
import { useQueryStates } from "nuqs";
import { Suspense, lazy } from "react";

import { SiteHeader } from "@/components/site-header";
import { adminLayout } from "@/layouts/compose";

import { OidcClient as OidcClientItem } from "./components/oidc-client";
import { dialogSearchParams } from "./params";

const CreateClientDialog = lazy(async () =>
  import("./components/create-dialog").then((m) => ({ default: m.CreateClientDialog })),
);
const UpdateClientDialog = lazy(async () =>
  import("./components/update-dialog").then((m) => ({ default: m.UpdateDialog })),
);
const DeleteClientDialog = lazy(async () =>
  import("./components/delete-dialog").then((m) => ({ default: m.DeleteClientDialog })),
);
const DetailClientDialog = lazy(async () =>
  import("./components/detail-dialog").then((m) => ({ default: m.DetailDialog })),
);

function OidcClient() {
  const { data, isPending } = useOidcClients();
  const [{ dialog, client_id }, setParams] = useQueryStates(dialogSearchParams);

  return (
    <>
      <SiteHeader title={"OIDC client"} />
      <div className="p-6">
        <div className="flex items-center justify-between gap-3 pb-4">
          <InputGroup className="max-w-sm">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search holdings or tickers..." />
          </InputGroup>
          <Button
            variant="outline"
            size="lg"
            onClick={() => void setParams({ client_id: null, dialog: "create" })}
          >
            New Client
          </Button>
        </div>
        <ItemGroup>
          {isPending ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            data?.map((client) => <OidcClientItem key={client.client_id} client={client} />)
          )}
        </ItemGroup>

        {/* Dialog */}
        {dialog === "create" && (
          <Suspense fallback={null}>
            <CreateClientDialog />
          </Suspense>
        )}
        {dialog === "edit" && client_id && (
          <Suspense fallback={null}>
            <UpdateClientDialog />
          </Suspense>
        )}
        {dialog === "delete" && client_id && (
          <Suspense fallback={null}>
            <DeleteClientDialog />
          </Suspense>
        )}
        {dialog === "view" && client_id && (
          <Suspense fallback={null}>
            <DetailClientDialog />
          </Suspense>
        )}
      </div>
    </>
  );
}

OidcClient.layout = adminLayout;

export default OidcClient;
