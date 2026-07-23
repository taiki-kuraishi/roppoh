import { Skeleton } from "@roppoh/shadcn/components/ui/skeleton";

import { SiteHeader } from "@/components/site-header";
import { adminLayout } from "@/layouts/admin-layout";

// Ported from apps/ura-roppoh/src/pages/organization/page.tsx (stub — not
// Implemented, skeletons only). <SsgoiTransition> dropped (decision #6).
function Organization() {
  return (
    <>
      <SiteHeader title="Organization" />
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </>
  );
}

Organization.layout = adminLayout;

export default Organization;
