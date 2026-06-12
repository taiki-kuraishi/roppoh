import type { useUser } from "@roppoh/better-auth-query/query";

import { useUpdateUser } from "@roppoh/better-auth-query/mutation";
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

import { dialogSearchParams } from "@/pages/user/params";

import { schema } from "../form-field";

interface Props {
  user: NonNullable<ReturnType<typeof useUser>["data"]>;
}

export const Form = (props: Props) => {
  const [, setParams] = useQueryStates(dialogSearchParams);

  const mutate = useUpdateUser({
    onError: () => void toast.error("Failed to update user."),
    onSuccess: () => {
      toast.success("User updated.");
      void setParams({ user_id: null, dialog: null });
    },
  });

  const form = useForm({
    defaultValues: {
      name: props.user.name,
      email: props.user.email,
    },
    onSubmit: async ({ value }) => await mutate.mutateAsync({ userId: props.user.id, data: value }),
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
        <DialogTitle>Update User</DialogTitle>
        <DialogDescription className="font-mono break-all">{props.user.id}</DialogDescription>
      </DialogHeader>

      {/* Body */}
      <FieldGroup className="py-6">
        {/* Name */}
        <form.Field name="name">
          {(field) => (
            <Field>
              <Label htmlFor={field.name}>Name</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                aria-invalid={!field.state.meta.isValid}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Email */}
        <form.Field name="email">
          {(field) => (
            <Field>
              <Label htmlFor={field.name}>Email</Label>
              <Input
                id={field.name}
                name={field.name}
                type="email"
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
              {isSubmitting ? <Spinner /> : "Save changes"}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
};
