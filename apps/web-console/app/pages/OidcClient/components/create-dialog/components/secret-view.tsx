import { Button } from "@roppoh/shadcn/components/ui/button";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@roppoh/shadcn/components/ui/dialog";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface Props {
  clientSecret: string;
  onDone: () => void;
}

export const SecretView = (props: Props) => (
  <>
    <DialogHeader>
      <DialogTitle>Client Created</DialogTitle>
      <DialogDescription>
        Make sure to copy your client secret now. You won&apos;t be able to see it again.
      </DialogDescription>
    </DialogHeader>

    <div className="flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-sm">
      <span className="flex-1 break-all">{props.clientSecret}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => {
          void navigator.clipboard.writeText(props.clientSecret);
          toast.success("Copied client secret");
        }}
      >
        <Copy />
      </Button>
    </div>

    <DialogFooter>
      <Button onClick={props.onDone}>Done</Button>
    </DialogFooter>
  </>
);
