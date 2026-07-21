/** @jsxImportSource hono/jsx */
import type { RootView } from "@hono/inertia";

import { serializePage } from "@hono/inertia";
import { Link, Script, ViteClient } from "vite-ssr-components/hono";

// Vite-ssr-components/react's <ReactRefresh/> can't be used from a hono/jsx
// File (it renders via react/jsx-runtime), so this reproduces its exact
// Dev-only preamble by hand. Must appear before /app/client.tsx so
// @vitejs/plugin-react's Fast Refresh runtime is installed first
// (otherwise: "can't detect preamble" at runtime).
//
// Hono/jsx statically types every JSX-returning function's return as
// `HtmlEscapedString | Promise<HtmlEscapedString>` (it supports async
// Components), which trips typescript/promise-function-async even though
// This component's body is fully synchronous. Marking it `async` instead
// Makes it invalid to use as a JSX tag (TS2786: "cannot be used as a JSX
// Component"), so the disable is the correct fix here, not a workaround.
// oxlint-disable-next-line typescript/promise-function-async
const ReactRefreshPreamble = () => {
  if (import.meta.env.PROD) {
    return null;
  }
  const refreshScript = `
    import RefreshRuntime from '/@react-refresh';
    RefreshRuntime.injectIntoGlobalHook(window);
    window.$RefreshReg$ = () => {};
    window.$RefreshSig$ = () => (type) => type;
    window.__vite_plugin_react_preamble_installed__ = true;
  `;
  return (
    <>
      <script type="module" src="/@react-refresh" />
      {/* Biome-ignore lint: fixed dev-only Vite preamble, no user input */}
      <script type="module" dangerouslySetInnerHTML={{ __html: refreshScript }} />
    </>
  );
};

// @hono/inertia's protocol (matching @inertiajs/core@3.x): the page object is
// NOT embedded as a `data-page` HTML attribute. It lives as the textContent
// Of a sibling <script data-page="{id}" type="application/json"> element,
// Read via `getInitialPageFromDOM(id)` -> `document.querySelector('script[data-page="app"][type="application/json"]')`.
// The mount element (`document.getElementById(id)`, default id "app") stays empty.
export const rootView: RootView = async (page) => {
  const html = (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Roppoh</title>
        <ViteClient />
        <ReactRefreshPreamble />
        <Link rel="stylesheet" href="/app/global.css" />
        <Script src="/app/client.tsx" />
      </head>
      <body>
        <script
          data-page="app"
          type="application/json"
          // Biome-ignore lint: mirrors @hono/inertia's documented pattern for embedding the page JSON verbatim.
          dangerouslySetInnerHTML={{ __html: serializePage(page) }}
        />
        <div id="app" />
      </body>
    </html>
  );

  // Hono/jsx's JSX.Element alias is `HtmlEscapedString | Promise<HtmlEscapedString>`
  // (HtmlEscapedString = `string & HtmlEscaped`, so it's a real string, not a
  // Class). This tree has no async children, so `html` is always the
  // Synchronous branch. The Promise branch of the union is what these two
  // Rules are (correctly, in general) wary of stringifying, but it can't
  // Occur here.
  // oxlint-disable-next-line typescript/no-base-to-string, typescript/restrict-template-expressions
  return `<!DOCTYPE html>${html}`;
};
