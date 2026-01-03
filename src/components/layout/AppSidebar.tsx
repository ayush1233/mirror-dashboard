import { LayoutDashboard, Repeat, Layers, Clock, History, GitCompare, Settings2, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const navItemBase = "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent/70 transition-colors";

export function AppSidebar() {
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="pb-1">
        <div className="flex items-center gap-2 px-2 pt-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[hsl(var(--primary))] to-[hsl(var(--accent))] shadow-[var(--shadow-glow)]" />
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Shadow</p>
            <p className="text-sm font-semibold">Mirror Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <nav className="space-y-1 px-1">
              <NavLink
                to="/dashboard"
                end
                className={cn(navItemBase, "text-muted-foreground")}
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard Home</span>
              </NavLink>
              <NavLink
                to="/run"
                className={cn(navItemBase, "text-muted-foreground")}
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
              >
                <Repeat className="h-4 w-4" />
                <span>Run Mirror Test</span>
              </NavLink>
              <NavLink
                to="/bulk-run"
                className={cn(navItemBase, "text-muted-foreground")}
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
              >
                <Layers className="h-4 w-4" />
                <span>Bulk Test Runner</span>
              </NavLink>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>History</SidebarGroupLabel>
          <SidebarGroupContent>
            <nav className="space-y-1 px-1">
              <NavLink
                to="/history/single"
                className={cn(navItemBase, "text-muted-foreground")}
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
              >
                <Clock className="h-4 w-4" />
                <span>Single Test History</span>
              </NavLink>
              <NavLink
                to="/history/bulk"
                className={cn(navItemBase, "text-muted-foreground")}
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
              >
                <History className="h-4 w-4" />
                <span>Bulk Test History</span>
              </NavLink>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Analysis</SidebarGroupLabel>
          <SidebarGroupContent>
            <nav className="space-y-1 px-1">
              <NavLink
                to="/compare"
                className={cn(navItemBase, "text-muted-foreground")}
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
              >
                <GitCompare className="h-4 w-4" />
                <span>Comparison Viewer</span>
              </NavLink>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-sidebar-border/70 pt-2">
        <nav className="space-y-1 px-1">
          <NavLink
            to="/settings"
            className={cn(navItemBase, "text-muted-foreground")}
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <Settings2 className="h-4 w-4" />
            <span>Settings</span>
          </NavLink>
          <button
            type="button"
            onClick={() => setAuthenticated(false)}
            className={cn(
              navItemBase,
              "w-full text-muted-foreground/80 hover:bg-destructive/90 hover:text-destructive-foreground",
            )}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </nav>
        <div className="mt-3 px-2">
          <span
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "text-[10px] tracking-[0.24em] uppercase text-muted-foreground/70",
            })}
          >
            Shadow • Mirror Engine
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
