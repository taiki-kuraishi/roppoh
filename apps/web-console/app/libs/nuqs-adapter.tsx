// Vendored from the nuqs shadcn registry (https://nuqs.dev/registry/adapter-inertia,
// https://nuqs.dev/r/adapter-inertia.json), by François Best <franky47>.
// NOT an npm dependency: nuqs's custom-adapter API is explicitly documented as
// Unstable ("may change in a minor or patch release, not following SemVer"),
// So this file is copy-pasted and self-maintained rather than installed.
// Upgrade by re-fetching the registry JSON above and diffing.
import { router, usePage } from "@inertiajs/react";
import {
  type unstable_AdapterInterface as AdapterInterface,
  type unstable_AdapterOptions as AdapterOptions,
  unstable_createAdapterProvider as createAdapterProvider,
  renderQueryString,
  type unstable_UpdateUrlFunction as UpdateUrlFunction,
} from "nuqs/adapters/custom";
import * as React from "react";

function useNuqsInertiaAdapter(): AdapterInterface {
  const currentUrl = usePage().url;
  // We need the searchParams to be optimistic to avoid
  // Flickering when the internal state is updated
  // But the URL is not yet updated.
  const [searchParams, setSearchParams] = React.useState(
    new URL(currentUrl, location.origin).searchParams,
  );

  React.useEffect(() => {
    setSearchParams(new URL(currentUrl, location.origin).searchParams);
  }, [currentUrl]);

  const updateUrl: UpdateUrlFunction = React.useCallback(
    (search: URLSearchParams, options: AdapterOptions) => {
      const url = new URL(globalThis.location.href);
      url.search = renderQueryString(search);
      setSearchParams(url.searchParams);

      // Server-side request
      if (options?.shallow === false) {
        router.visit(url, {
          replace: options.history === "replace",
          preserveScroll: !options.scroll,
          preserveState: true,
          async: true,
        });
        return;
      }

      const method = options.history === "replace" ? "replace" : "push";

      router[method]({
        url: url.pathname + url.search + url.hash,
        clearHistory: false,
        encryptHistory: false,
        preserveScroll: !options.scroll,
        preserveState: true,
      });
    },
    [],
  );

  return {
    searchParams,
    updateUrl,
  };
}

export const NuqsAdapter = createAdapterProvider(useNuqsInertiaAdapter);
