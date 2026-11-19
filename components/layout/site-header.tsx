"use client";

import { LogOutIcon, MoonIcon, SunIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { data } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
            IF
          </div>
          <h1 className="text-sm font-semibold tracking-wide uppercase sm:text-base">
            InventoryFinder
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {data?.user?.email ? (
            <span className="hidden max-w-[180px] truncate text-xs text-muted-foreground sm:inline">
              {data.user.email}
            </span>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              signOut({
                redirect: true,
                redirectTo: "/",
              })
            }
          >
            <LogOutIcon data-icon="inline-start" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
