import { useAtom, useAtomValue } from "jotai/react";
import {
  atomWithStorage,
  createJSONStorage,
  unstable_withStorageValidator as withStorageValidator,
} from "jotai/utils";
import { useEffect } from "react";
import * as v from "valibot";

const ThemeSchema = v.union([v.literal("dark"), v.literal("light"), v.literal("system")]);

export type Theme = v.InferInput<typeof ThemeSchema>;

const isTheme = (value: unknown): value is Theme => v.safeParse(ThemeSchema, value).success;

const themeAtom = atomWithStorage<Theme>(
  "theme",
  "system",
  withStorageValidator(isTheme)(createJSONStorage(() => localStorage)),
);

const useTheme = () => {
  const [value, setValue] = useAtom(themeAtom);
  return {
    setTheme: setValue,
    theme: value,
  };
};

function useThemeProvider() {
  const theme = useAtomValue(themeAtom);

  useEffect(() => {
    const root = globalThis.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = globalThis.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return {};
}

export { useTheme, useThemeProvider };
