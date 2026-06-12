import type { useOidcClient } from "@roppoh/better-auth-query/query";

import { Button } from "@roppoh/shadcn/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@roppoh/shadcn/components/ui/dialog";

type OidcClientData = NonNullable<ReturnType<typeof useOidcClient>["data"]>;

interface Props {
  client: OidcClientData;
}

type FieldKey = keyof OidcClientData;

const FIELD_ORDER = [
  "id",
  "client_id",
  "client_secret",
  "client_name",
  "disabled",
  "public",
  "type",
  "subject_type",
  "token_endpoint_auth_method",
  "require_pkce",
  "skip_consent",
  "enable_end_session",
  "redirect_uris",
  "post_logout_redirect_uris",
  "scopes",
  "grant_types",
  "response_types",
  "contacts",
  "icon",
  "policy",
  "tos",
  "uri",
  "software_id",
  "software_version",
  "software_statement",
  "metadata",
  "reference_id",
  "user_id",
  "created_at",
  "updated_at",
] as const satisfies readonly FieldKey[];

const NullValue = () => <span className="text-muted-foreground italic">null</span>;

const ArrayValue = ({ value }: { value: readonly unknown[] }) => {
  if (value.length === 0) {
    return <NullValue />;
  }
  return (
    <ul className="list-disc space-y-1 pl-4">
      {value.map((item, index) => (
        <li key={index} className="font-mono break-all">
          {typeof item === "string" ? item : JSON.stringify(item)}
        </li>
      ))}
    </ul>
  );
};

const ObjectValue = ({ value }: { value: object }) => (
  <pre className="font-mono text-xs break-all whitespace-pre-wrap">
    {JSON.stringify(value, null, 2)}
  </pre>
);

const ScalarValue = ({ value }: { value: bigint | boolean | number | string }) => (
  <span className="font-mono break-all">
    {typeof value === "boolean" ? String(value) : value.toString()}
  </span>
);

const ComplexValue = ({ value }: { value: object }) => {
  if (value instanceof Date) {
    return <span className="font-mono">{value.toISOString()}</span>;
  }
  if (Array.isArray(value)) {
    return <ArrayValue value={value} />;
  }
  return <ObjectValue value={value} />;
};

const FieldValue = ({ value }: { value: unknown }) => {
  if (value === null || value === undefined) {
    return <NullValue />;
  }
  if (typeof value === "object") {
    return <ComplexValue value={value} />;
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return <ScalarValue value={value} />;
  }
  return <NullValue />;
};

export const Content = (props: Props) => (
  <>
    <DialogHeader>
      <DialogTitle>OIDC Client Details</DialogTitle>
      <DialogDescription className="font-mono break-all">
        {props.client.client_id}
      </DialogDescription>
    </DialogHeader>

    <dl className="grid max-h-[60vh] grid-cols-[140px_1fr] gap-x-4 gap-y-3 overflow-y-auto py-4 pr-2 text-sm">
      {FIELD_ORDER.map((key) => (
        <div key={key} className="contents">
          <dt className="text-muted-foreground text-xs tracking-wider uppercase">{key}</dt>
          <dd className="min-w-0">
            <FieldValue value={props.client[key]} />
          </dd>
        </div>
      ))}
    </dl>

    <DialogFooter>
      <DialogClose render={<Button variant="outline">Close</Button>} />
    </DialogFooter>
  </>
);
