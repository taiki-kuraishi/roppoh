/** @jsxImportSource hono/jsx */
import type { RootView } from "@hono/inertia";

import { serializePage } from "@hono/inertia";
import { Link, Script, ViteClient } from "vite-ssr-components/hono";

import { ReactRefreshPreamble } from "./components/react-refresh-preamble";

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
        <title>Web Console</title>
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
  // Synchronous branch — confirmed at runtime (Phase 0 spike: curl'd the
  // Rendered shell and browser-mounted it successfully). The Promise branch
  // Of the union is what these two rules are (correctly, in general) wary
  // Of stringifying, but it can't occur here.
  // oxlint-disable-next-line typescript/no-base-to-string, typescript/restrict-template-expressions
  return `<!DOCTYPE html>${html}`;
};
