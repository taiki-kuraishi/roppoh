import { useUsers } from "@roppoh/better-auth-query/infinite";
import { Button } from "@roppoh/shadcn/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@roppoh/shadcn/components/ui/input-group";
import { ItemGroup } from "@roppoh/shadcn/components/ui/item";
import { Skeleton } from "@roppoh/shadcn/components/ui/skeleton";
import { SsgoiTransition } from "@ssgoi/react";
import { Search } from "lucide-react";
import { useQueryStates } from "nuqs";
import { Suspense, lazy } from "react";

import { SiteHeader } from "@/components/header";

import { UserItem } from "./components/user";
import { dialogSearchParams } from "./params";

const CreateUserDialog = lazy(async () =>
  import("./components/create-dialog").then((m) => ({ default: m.CreateUserDialog })),
);
const DetailDialog = lazy(async () =>
  import("./components/detail-dialog").then((m) => ({ default: m.DetailDialog })),
);
const UpdateDialog = lazy(async () =>
  import("./components/update-dialog").then((m) => ({ default: m.UpdateDialog })),
);
const SetRoleDialog = lazy(async () =>
  import("./components/set-role-dialog").then((m) => ({ default: m.SetRoleDialog })),
);
const BanDialog = lazy(async () =>
  import("./components/ban-dialog").then((m) => ({ default: m.BanDialog })),
);
const SetPasswordDialog = lazy(async () =>
  import("./components/set-password-dialog").then((m) => ({ default: m.SetPasswordDialog })),
);
const SessionsDialog = lazy(async () =>
  import("./components/sessions-dialog").then((m) => ({ default: m.SessionsDialog })),
);
const ImpersonateDialog = lazy(async () =>
  import("./components/impersonate-dialog").then((m) => ({ default: m.ImpersonateDialog })),
);
const DeleteUserDialog = lazy(async () =>
  import("./components/delete-dialog").then((m) => ({ default: m.DeleteUserDialog })),
);

export default function () {
  const { data, isPending } = useUsers({ size: 100 });
  const [{ dialog, user_id }, setParams] = useQueryStates(dialogSearchParams);

  return (
    <SsgoiTransition id="/user">
      <SiteHeader title={"User"} />
      <div className="p-6">
        <div className="flex items-center justify-between gap-3 pb-4">
          <InputGroup className="max-w-sm">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search users..." />
          </InputGroup>
          <Button
            variant="outline"
            size="lg"
            onClick={() => void setParams({ user_id: null, dialog: "create" })}
          >
            New User
          </Button>
        </div>
        <ItemGroup>
          {isPending ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            data?.pages
              .flatMap((page) => page.users)
              .map((user) => <UserItem key={user.id} user={user} />)
          )}
        </ItemGroup>

        {/* Dialog */}
        {dialog === "create" && (
          <Suspense fallback={null}>
            <CreateUserDialog />
          </Suspense>
        )}
        {dialog === "view" && user_id && (
          <Suspense fallback={null}>
            <DetailDialog />
          </Suspense>
        )}
        {dialog === "edit" && user_id && (
          <Suspense fallback={null}>
            <UpdateDialog />
          </Suspense>
        )}
        {dialog === "role" && user_id && (
          <Suspense fallback={null}>
            <SetRoleDialog />
          </Suspense>
        )}
        {dialog === "ban" && user_id && (
          <Suspense fallback={null}>
            <BanDialog />
          </Suspense>
        )}
        {dialog === "password" && user_id && (
          <Suspense fallback={null}>
            <SetPasswordDialog />
          </Suspense>
        )}
        {dialog === "sessions" && user_id && (
          <Suspense fallback={null}>
            <SessionsDialog />
          </Suspense>
        )}
        {dialog === "impersonate" && user_id && (
          <Suspense fallback={null}>
            <ImpersonateDialog />
          </Suspense>
        )}
        {dialog === "delete" && user_id && (
          <Suspense fallback={null}>
            <DeleteUserDialog />
          </Suspense>
        )}
      </div>
    </SsgoiTransition>
  );
}
