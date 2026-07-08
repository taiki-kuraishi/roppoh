import type { RequestHandler } from "msw";
import type { MockServiceWorker } from "playwright-msw";

import { test } from "@playwright/test";
import { createWorkerFixture } from "playwright-msw";

export const testWithMswMock = (handlers: RequestHandler[]) =>
  test.extend<{ worker: MockServiceWorker }>({ worker: createWorkerFixture(handlers, {}) });
