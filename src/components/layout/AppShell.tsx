import { ReactNode, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { SunMedium, MoonStar } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const theme = useAppStore((s) => s.theme);
  const updateSettings = useAppStore((s) => s.updateSettings);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => updateSettings({ theme: theme === "dark" ? "light" : "dark" });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--card))]">
        <AppSidebar />
        <SidebarInset className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/80 bg-background/80 px-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Shadow Mirror</p>
                <h1 className="text-sm font-semibold">Spring Boot Test Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-border/70 bg-card/60 shadow-sm"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                <span className={cn("transition-opacity", theme === "dark" ? "opacity-100" : "opacity-0 absolute")}
                  ><MoonStar className="h-4 w-4" /></span
                >
                <span className={cn("transition-opacity", theme === "light" ? "opacity-100" : "opacity-0 absolute")}
                  ><SunMedium className="h-4 w-4" /></span
                >
              </Button>
            </div>
          </header>
          <main className="flex-1 px-4 pb-6 pt-4">
            <div className="mx-auto max-w-6xl animate-enter">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
