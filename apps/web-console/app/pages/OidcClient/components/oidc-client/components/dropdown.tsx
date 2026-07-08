import type { OAuthClient } from "@better-auth/oauth-provider";

import { Button } from "@roppoh/shadcn/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@roppoh/shadcn/components/ui/dropdown-menu";
import { MoreHorizontalIcon } from "lucide-react";
import { useQueryStates } from "nuqs";

import { dialogSearchParams } from "@/pages/OidcClient/params";

interface Props {
  client: Pick<OAuthClient, "client_id">;
}

export const DropDown = (props: Props) => {
  const [, setParams] = useQueryStates(dialogSearchParams);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="secondary" size="lg" />}>
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => void setParams({ client_id: props.client.client_id, dialog: "view" })}
        >
          Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void setParams({ client_id: props.client.client_id, dialog: "edit" })}
        >
          Update
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void setParams({ client_id: props.client.client_id, dialog: "delete" })}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
