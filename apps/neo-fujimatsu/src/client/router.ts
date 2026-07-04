import type { ComponentType } from "react";

import { createBrowserRouter } from "react-router";

const lazyDefault = (importFn: () => Promise<{ default: ComponentType<unknown> }>) => async () => {
  const module = await importFn();
  return module.default;
};

const lazyNamed =
  <K extends string>(importFn: () => Promise<Record<K, ComponentType<unknown>>>, name: K) =>
  async () => {
    const module = await importFn();
    return module[name];
  };

export const router = createBrowserRouter([
  {
    children: [
      {
        lazy: {
          Component: lazyDefault(async () => import("./pages/sign-in/page")),
        },
        path: "/sign-in",
      },
      {
        children: [
          {
            lazy: {
              Component: lazyDefault(async () => import("./pages/account/page")),
            },
            path: "/account",
          },
        ],
        lazy: {
          Component: lazyDefault(async () => import("./layouts/authenticated-layout")),
        },
      },
      {
        lazy: {
          Component: lazyDefault(async () => import("./pages/consent/page")),
        },
        path: "/consent",
      },
      {
        lazy: {
          Component: lazyDefault(async () => import("./pages/404/page")),
        },
        path: "*",
      },
    ],
    lazy: {
      Component: lazyNamed(async () => import("./root"), "Root"),
    },
  },
]);
