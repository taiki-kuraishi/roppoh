import type { OAuthClient } from "@better-auth/oauth-provider";

import { Item, ItemContent, ItemDescription, ItemTitle } from "@roppoh/shadcn/components/ui/item";

import { DropDown } from "./components/dropdown";
import { ClientStatus } from "./components/status";

interface Props {
  client: Pick<OAuthClient, "client_id" | "client_name" | "disabled">;
}

export const OidcClient = (props: Props) => (
  <Item variant="muted">
    <ItemContent>
      <ItemTitle>{props.client.client_id}</ItemTitle>
      <ItemDescription className="text-xs tracking-wider uppercase">
        name: {props.client.client_name || "null"}
      </ItemDescription>
    </ItemContent>
    <div className="flex shrink-0 items-center gap-6">
      <ClientStatus disabled={props.client.disabled} />
      <DropDown client={props.client} />
    </div>
  </Item>
);
