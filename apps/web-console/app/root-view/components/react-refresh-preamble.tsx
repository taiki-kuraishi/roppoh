/** @jsxImportSource hono/jsx */

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
export const ReactRefreshPreamble = () => {
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
