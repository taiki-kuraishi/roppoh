import type { Page } from "@playwright/test";

import type { Theme } from "@/providers/theme-provider";

interface Args {
  page: Page;
  theme: Theme;
}

export const setTheme = async (args: Args) =>
  await args.page.context().addInitScript((theme) => {
    localStorage.setItem("theme", `"${theme}"`);
  }, args.theme);
