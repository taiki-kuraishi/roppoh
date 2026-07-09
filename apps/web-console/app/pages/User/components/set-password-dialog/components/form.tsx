import type { useUser } from "@roppoh/better-auth-query/query";

import { useSetUserPassword } from "@roppoh/better-auth-query/mutation";
import { Button } from "@roppoh/shadcn/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@roppoh/shadcn/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@roppoh/shadcn/components/ui/field";
import { Input } from "@roppoh/shadcn/components/ui/input";
import { Label } from "@roppoh/shadcn/components/ui/label";
import { Spinner } from "@roppoh/shadcn/components/ui/spinner";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useQueryStates } from "nuqs";
import { toast } from "sonner";

import { dialogSearchParams } from "@/pages/User/params";

import { defaultValues, schema } from "../form-field";

interface Props {
  user: NonNullable<ReturnType<typeof useUser>["data"]>;
}

export const Form = (props: Props) => {
  const [, setParams] = useQueryStates(dialogSearchParams);

  const mutate = useSetUserPassword({
    onError: () => void toast.error("Failed to set password."),
    onSuccess: () => {
      toast.success("Password updated.");
      void setParams({ user_id: null, dialog: null });
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) =>
      await mutate.mutateAsync({ userId: props.user.id, newPassword: value.newPassword }),
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      {/* Header */}
      <DialogHeader>
        <DialogTitle>Set Password</DialogTitle>
        <DialogDescription>
          {props.user.name} ({props.user.email})
        </DialogDescription>
      </DialogHeader>

      {/* Body */}
      <FieldGroup className="py-6">
        <form.Field name="newPassword">
          {(field) => (
            <Field>
              <Label htmlFor={field.name}>New Password</Label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={!field.state.meta.isValid}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>
      </FieldGroup>

      {/* Footer */}
      <DialogFooter>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? <Spinner /> : "Save"}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
};
