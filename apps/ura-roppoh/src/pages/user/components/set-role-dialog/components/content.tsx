import type { useUser } from "@roppoh/better-auth-query/query";

import { useSetUserRole } from "@roppoh/better-auth-query/mutation";
import { Button } from "@roppoh/shadcn/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@roppoh/shadcn/components/ui/dialog";
import { Field } from "@roppoh/shadcn/components/ui/field";
import { Label } from "@roppoh/shadcn/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@roppoh/shadcn/components/ui/select";
import { Spinner } from "@roppoh/shadcn/components/ui/spinner";
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

import { ROLES, type Role } from "@/pages/user/constant";
import { dialogSearchParams } from "@/pages/user/params";

interface Props {
  user: NonNullable<ReturnType<typeof useUser>["data"]>;
}

export const Content = (props: Props) => {
  const [, setParams] = useQueryStates(dialogSearchParams);
  const [role, setRole] = useState<Role>(ROLES.find((r) => r === props.user.role) ?? "user");

  const { mutateAsync, isPending } = useSetUserRole({
    onError: () => void toast.error("Failed to set role."),
    onSuccess: () => {
      toast.success("Role updated.");
      void setParams({ user_id: null, dialog: null });
    },
  });

  const handleSubmit = async () => await mutateAsync({ userId: props.user.id, role });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Set Role</DialogTitle>
        <DialogDescription>
          {props.user.name} ({props.user.email})
        </DialogDescription>
      </DialogHeader>

      <div className="py-6">
        <Field>
          <Label>Role</Label>
          <Select
            value={role}
            onValueChange={(value) => {
              const next = ROLES.find((r) => r === value);
              if (next) {
                setRole(next);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? <Spinner /> : "Save"}
        </Button>
      </DialogFooter>
    </>
  );
};
