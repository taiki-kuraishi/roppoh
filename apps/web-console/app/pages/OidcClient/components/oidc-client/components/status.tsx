import { Badge } from "@roppoh/shadcn/components/ui/badge";

interface Props {
  disabled: boolean | undefined;
}

export const ClientStatus = (props: Props) => {
  if (props.disabled === true) {
    return (
      <Badge variant="outline">
        <span className="size-2 rounded-full bg-green-500" />
        Enable
      </Badge>
    );
  }
  if (props.disabled === false) {
    return (
      <Badge variant="outline">
        <span className="size-2 rounded-full bg-gray-500" />
        Disabled
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      <span className="size-2 rounded-full bg-yellow-500" />
      Undefined
    </Badge>
  );
};
