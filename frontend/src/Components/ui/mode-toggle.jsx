import * as React from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 sm:h-9 sm:w-9" disabled aria-hidden>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const Icon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 sm:h-9 sm:w-9"
          aria-label={`Theme: ${theme === "system" ? `system (${resolvedTheme})` : theme}. Change appearance.`}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuItem onClick={() => setTheme("light")} className="justify-between gap-2">
          <span className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Light
          </span>
          {theme === "light" && <Check className="h-4 w-4 opacity-70" aria-hidden />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="justify-between gap-2">
          <span className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Dark
          </span>
          {theme === "dark" && <Check className="h-4 w-4 opacity-70" aria-hidden />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="justify-between gap-2">
          <span className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            System
          </span>
          {theme === "system" && <Check className="h-4 w-4 opacity-70" aria-hidden />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
