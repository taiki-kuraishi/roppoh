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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@roppoh/shadcn/components/ui/select";
import { Spinner } from "@roppoh/shadcn/components/ui/spinner";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useQueryStates } from "nuqs";
import { toast } from "sonner";

import { useCreateUserMutation } from "@/hooks/better-auth";
import { ROLES } from "@/pages/user/constant";
import { dialogSearchParams } from "@/pages/user/params";

import { defaultValues, schema } from "../form-field";

export const Form = () => {
  const [, setParams] = useQueryStates(dialogSearchParams);

  const mutate = useCreateUserMutation({
    onError: () => void toast.error("Failed to create user."),
    onSuccess: () => {
      toast.success("User created.");
      void setParams({ user_id: null, dialog: null });
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => await mutate.mutateAsync(value),
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
        <DialogTitle>Create User</DialogTitle>
        <DialogDescription>Create a new user account.</DialogDescription>
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

        {/* Password */}
        <form.Field name="password">
          {(field) => (
            <Field>
              <Label htmlFor={field.name}>Password</Label>
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

        {/* Role */}
        <form.Field name="role">
          {(field) => (
            <Field>
              <Label htmlFor={field.name}>Role</Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  const role = ROLES.find((r) => r === value);
                  if (role) {
                    field.handleChange(role);
                  }
                }}
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {isSubmitting ? <Spinner /> : "Create"}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
};
