import { Link, useRouterState, useNavigate, useParams } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Search,
  FileText,
  Network,
  Users,
  MapPin,
  Package,
  Clapperboard,
  ClipboardList,
  CalendarRange,
  StickyNote,
  LogOut,
  Clapperboard as Logo,
  ChevronLeft,
  Download,
  Shirt,
  UsersRound,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";

const globalItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Global Search", url: "/search", icon: Search },
];

const moduleItems = (pid: string) => [
  { title: "Overview", url: `/project/${pid}`, icon: LayoutDashboard, exact: true },
  { title: "Script Writer", url: `/project/${pid}/script`, icon: FileText },
  { title: "Story Structure", url: `/project/${pid}/structure`, icon: Network },
  { title: "Characters", url: `/project/${pid}/characters`, icon: Users },
  { title: "Locations", url: `/project/${pid}/locations`, icon: MapPin },
  { title: "Props", url: `/project/${pid}/props`, icon: Package },
  { title: "Costume & Dress", url: `/project/${pid}/costumes`, icon: Shirt },
  { title: "Storyboard", url: `/project/${pid}/storyboard`, icon: Clapperboard },
  { title: "Call Sheets", url: `/project/${pid}/callsheets`, icon: ClipboardList },
  { title: "Schedule", url: `/project/${pid}/schedule`, icon: CalendarRange },
  { title: "Notes", url: `/project/${pid}/notes`, icon: StickyNote },
  { title: "Team", url: `/project/${pid}/team`, icon: UsersRound },
  { title: "Export", url: `/project/${pid}/export`, icon: Download },
];

export function AppSidebar() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const params = useParams({ strict: false }) as { projectId?: string };
  const pid = params.projectId;

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  const initials = (profile?.name || user?.email || "U").slice(0, 2).toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Logo className="h-5 w-5" />
          </div>
          <div className="leading-tight group-data-[collapsible=icon]:hidden">
            <p className="font-mono text-sm font-bold tracking-tight">HEISENBERG</p>
            <p className="text-[10px] text-sidebar-foreground/60">PRE-PRODUCTION</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {globalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {pid && (
          <SidebarGroup>
            <SidebarGroupLabel>Project</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {moduleItems(pid).map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url, (item as any).exact)}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 text-sidebar-foreground/70"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>All Projects</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-1 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.photo_url ?? undefined} />
            <AvatarFallback className="bg-secondary text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-medium">{profile?.name || "Filmmaker"}</p>
            <p className="truncate text-[10px] text-sidebar-foreground/60">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
