import { useAddPasskey } from "@roppoh/better-auth-query/mutation";
import { Button } from "@roppoh/shadcn/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@roppoh/shadcn/components/ui/dialog";
import { Field, FieldGroup } from "@roppoh/shadcn/components/ui/field";
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
import { useQueryStates } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

import { dialogSearchParams } from "@/client/pages/account/params";

const ATTACHMENT_OPTIONS = ["platform", "cross-platform"] as const;
type Attachment = (typeof ATTACHMENT_OPTIONS)[number];

export const Form = () => {
  const [, setParams] = useQueryStates(dialogSearchParams);
  const [name, setName] = useState("");
  const [attachment, setAttachment] = useState<Attachment>("platform");

  const { mutateAsync, isPending } = useAddPasskey({
    onError: (error) => void toast.error(error.message || "Failed to register passkey"),
    onSuccess: () => {
      toast.success("Passkey registered");
      void setParams({ dialog: null, passkey_id: null });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Name is required");
      return;
    }
    await mutateAsync({ authenticatorAttachment: attachment, name: trimmed });
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Add passkey</DialogTitle>
        <DialogDescription>
          Give your passkey a recognizable name, then follow your device&apos;s prompt to complete
          registration.
        </DialogDescription>
      </DialogHeader>

      <FieldGroup className="py-6">
        <Field>
          <Label htmlFor="passkey-name">Name</Label>
          <Input
            id="passkey-name"
            name="name"
            placeholder="e.g. MacBook Touch ID"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </Field>

        <Field>
          <Label htmlFor="passkey-attachment">Authenticator</Label>
          <Select
            value={attachment}
            onValueChange={(value) => {
              const option = ATTACHMENT_OPTIONS.find((o) => o === value);
              if (option) {
                setAttachment(option);
              }
            }}
          >
            <SelectTrigger id="passkey-attachment" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ATTACHMENT_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === "platform"
                    ? "This device (platform)"
                    : "Security key (cross-platform)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      <DialogFooter>
        <DialogClose
          render={
            <Button variant="outline" type="button">
              Cancel
            </Button>
          }
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? <Spinner /> : "Register"}
        </Button>
      </DialogFooter>
    </form>
  );
};
