import { Badge } from "@roppoh/shadcn/components/ui/badge";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@roppoh/shadcn/components/ui/item";

import type { User } from "../../types";

import { DropDown } from "./components/dropdown";
import { UserStatus } from "./components/status";

interface Props {
  user: User;
}

export const UserItem = (props: Props) => (
  <Item variant="muted">
    <ItemContent>
      <ItemTitle>{props.user.name}</ItemTitle>
      <ItemDescription className="text-xs lowercase">{props.user.email}</ItemDescription>
    </ItemContent>
    <div className="flex shrink-0 items-center gap-6">
      {props.user.role ? <Badge variant="secondary">{props.user.role}</Badge> : null}
      <UserStatus banned={props.user.banned} />
      <DropDown user={props.user} />
    </div>
  </Item>
);
