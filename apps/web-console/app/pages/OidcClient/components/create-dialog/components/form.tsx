// oxlint-disable max-lines, max-lines-per-function
// TODO: フィールド群を components/ に分割して max-lines(150)/ max-lines-per-function(100)を満たす
import type { OAuthClient } from "@better-auth/oauth-provider";

import { useCreateOidcClient } from "@roppoh/better-auth-query/mutation";
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
import { Plus, X } from "lucide-react";
import { useQueryStates } from "nuqs";
import { toast } from "sonner";

import { dialogSearchParams } from "@/pages/OidcClient/params";

import { TOKEN_ENDPOINT_AUTH_METHODS, defaultValues, schema } from "../form-field";

interface Props {
  onSuccess?: (data: OAuthClient) => void;
}

export const Form = (props: Props) => {
  const [, setParams] = useQueryStates(dialogSearchParams);

  const mutate = useCreateOidcClient({
    onError: () => void toast.error("Failed create OIDC client mutation."),
    onSuccess: (data) =>
      props.onSuccess ? props.onSuccess(data) : void setParams({ client_id: null, dialog: null }),
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => mutate.mutateAsync(value),
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
        <DialogTitle>Create OIDC Client</DialogTitle>
        <DialogDescription>
          Make changes to your profile here. Click save when you&apos;re done.
        </DialogDescription>
      </DialogHeader>

      {/* Body */}
      <FieldGroup className="py-6">
        {/* Client_name */}
        <form.Field name="client_name">
          {(field) => (
            <Field>
              <Label htmlFor={field.name}>Client Name</Label>
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

        {/* Token_endpoint_auth_method */}
        <form.Field name="token_endpoint_auth_method">
          {(field) => (
            <Field>
              <Label htmlFor={field.name}>Token Endpoint Auth Method</Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  const method = TOKEN_ENDPOINT_AUTH_METHODS.find((m) => m === value);
                  if (method) {
                    field.handleChange(method);
                  }
                }}
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOKEN_ENDPOINT_AUTH_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>

        {/* Redirect_uris */}
        <form.Field name="redirect_uris">
          {(field) => (
            <>
              <Label>Redirect URIs</Label>
              <div className="flex flex-col gap-3">
                {field.state.value.map((_, index) => (
                  <form.Field key={index} name={`redirect_uris[${index}]`}>
                    {(itemField) => (
                      <Field>
                        <div className="flex items-center gap-2">
                          <Input
                            id={itemField.name}
                            name={itemField.name}
                            value={itemField.state.value}
                            onChange={(e) => itemField.handleChange(e.target.value)}
                            onBlur={itemField.handleBlur}
                            aria-invalid={!itemField.state.meta.isValid}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => field.removeValue(index)}
                          >
                            <X />
                          </Button>
                        </div>
                        <FieldError errors={itemField.state.meta.errors} />
                      </Field>
                    )}
                  </form.Field>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={() => field.pushValue("")}>
                <Plus />
                Add redirect uri
              </Button>
            </>
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
