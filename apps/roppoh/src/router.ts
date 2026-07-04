import type { ComponentType } from "react";

import { createBrowserRouter } from "react-router";

import { ErrorBoundary } from "./root/error-boundary";

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
    ErrorBoundary,
    children: [
      {
        children: [
          {
            children: [
              {
                index: true,
                lazy: {
                  Component: lazyDefault(async () => import("./pages/index/page")),
                },
              },
            ],
            lazy: {
              Component: lazyDefault(async () => import("./layouts/sidebar-layout")),
            },
          },
        ],
        lazy: {
          Component: lazyDefault(async () => import("./layouts/authenticated-layout")),
        },
      },
      {
        lazy: {
          Component: lazyDefault(async () => import("./pages/login/page")),
        },
        path: "/login",
      },
      {
        lazy: {
          Component: lazyDefault(async () => import("./pages/callback/page")),
        },
        path: "/callback",
      },
      {
        lazy: {
          Component: lazyDefault(async () => import("./pages/consent/page")),
        },
        path: "/consent",
      },
    ],
    lazy: {
      Component: lazyNamed(async () => import("./root"), "Root"),
    },
  },
]);
