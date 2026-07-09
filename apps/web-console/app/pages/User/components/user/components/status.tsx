import { Badge } from "@roppoh/shadcn/components/ui/badge";

interface Props {
  banned: boolean | null | undefined;
}

export const UserStatus = (props: Props) => {
  if (props.banned === true) {
    return (
      <Badge variant="outline">
        <span className="size-2 rounded-full bg-red-500" />
        Banned
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      <span className="size-2 rounded-full bg-green-500" />
      Active
    </Badge>
  );
};
