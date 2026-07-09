// oxlint-disable max-lines-per-function
// TODO: フィールド群を components/ に分割して max-lines-per-function(100)を満たす
import type { useOidcClient } from "@roppoh/better-auth-query/query";

import { useUpdateOidcClient } from "@roppoh/better-auth-query/mutation";
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
import { Plus, X } from "lucide-react";
import { useQueryStates } from "nuqs";
import { toast } from "sonner";

import { dialogSearchParams } from "@/pages/OidcClient/params";

import { schema } from "./form-field";

interface Props {
  client: NonNullable<ReturnType<typeof useOidcClient>["data"]>;
}

export const Form = (props: Props) => {
  const [, setParams] = useQueryStates(dialogSearchParams);

  const mutate = useUpdateOidcClient({
    onError: () => void toast.error("Failed update OIDC client mutation."),
    onSuccess: () => void setParams({ client_id: null, dialog: null }),
  });

  const form = useForm({
    defaultValues: {
      client_name: props.client.client_name ?? "",
      redirect_uris: props.client.redirect_uris ?? ([] satisfies string[]),
    },
    onSubmit: async ({ value }) =>
      await mutate.mutateAsync({ client_id: props.client.client_id, update: value }),
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
        <DialogTitle>Update OIDC Client</DialogTitle>
        <DialogDescription>{props.client.client_id}</DialogDescription>
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
