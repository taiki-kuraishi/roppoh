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

import { dialogSearchParams } from "@/pages/User/params";

import type { User } from "../../../types";

interface Props {
  user: Pick<User, "id" | "banned">;
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
          onClick={() => void setParams({ user_id: props.user.id, dialog: "view" })}
        >
          Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void setParams({ user_id: props.user.id, dialog: "edit" })}
        >
          Update
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => void setParams({ user_id: props.user.id, dialog: "role" })}
        >
          Set Role
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void setParams({ user_id: props.user.id, dialog: "ban" })}>
          {props.user.banned ? "Unban" : "Ban"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => void setParams({ user_id: props.user.id, dialog: "password" })}
        >
          Set Password
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => void setParams({ user_id: props.user.id, dialog: "sessions" })}
        >
          Manage Sessions
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => void setParams({ user_id: props.user.id, dialog: "impersonate" })}
        >
          Impersonate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void setParams({ user_id: props.user.id, dialog: "delete" })}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
