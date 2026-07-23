import { SiteHeader } from "@/components/site-header";
import { appLayout } from "@/layouts/app-layout";

// Ported from apps/ura-roppoh/src/pages/index/page.tsx (welcome screen).
// <SsgoiTransition> dropped per decision #6 (ssgoi is not carried into
// Phase 1); rebranded from "Ura Roppoh"/"Roppoh" to "Web Console".
function Index() {
  return (
    <>
      <SiteHeader title="welcome" />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 transform text-center">
        <h1 className="font-bold text-2xl">Welcome to Web Console</h1>
        <div className="text-muted-foreground">Web Console is Roppoh's admin console.</div>
      </div>
    </>
  );
}

Index.layout = appLayout;

export default Index;
