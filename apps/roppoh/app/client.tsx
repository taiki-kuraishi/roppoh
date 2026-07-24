import { createInertiaApp, type ResolvedComponent } from "@inertiajs/react";
import { createRoot } from "react-dom/client";

import { AppProviders } from "./providers/app-providers";
import { ErrorBoundary } from "./providers/error-boundary";
import "./global.css";

void createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<{ default: ResolvedComponent }>("./pages/**/*.tsx", {
      eager: true,
    });
    const page = pages[`./pages/${name}.tsx`];
    if (!page) {
      throw new Error(`Unknown Inertia page: ${name}`);
    }
    return page;
  },
  setup({ el, App, props }) {
    if (!el) {
      throw new Error("Inertia mount element (#app) not found");
    }
    createRoot(el).render(
      <ErrorBoundary>
        <AppProviders>
          <App {...props} />
        </AppProviders>
      </ErrorBoundary>,
    );
  },
});
