import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@roppoh/shadcn/components/ui/dropdown-menu";
import { SunMoon } from "lucide-react";

import { useTheme } from "@/providers/theme-provider";

export function ThemeSwitcher() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="w-full">
        <SunMoon />
        <p>Toggle theme</p>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
