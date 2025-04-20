import { NavFooter } from "./NavFooter";
import { NavMain } from "./NavMain";
import { NavUser } from "./NavUser";
import { format } from "date-fns";
import { Rocket, Table, Calendar } from "lucide-react";
import { Link } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import type { NavItem } from "~/types";
import ApplicationLogo from "~/components/ApplicationLogo";

const mainNavItems: NavItem[] = [
  // {
  //     title: 'Dashboard',
  //     href: '/dashboard',
  //     icon: LayoutGrid,
  // },
  {
    title: "Track",
    href: `/track/${format(new Date(), "yyyy-MM-dd")}`,
    icon: Rocket,
  },
  {
    title: "Log",
    href: `/log`,
    icon: Table,
  },
  {
    title: "Yearly View",
    href: `/yearly-view`,
    icon: Calendar,
  },
];

const footerNavItems: NavItem[] = [
  // {
  //     title: 'Repository',
  //     href: 'https://github.com/laravel/react-starter-kit',
  //     icon: Folder,
  // },
  // {
  //     title: 'Documentation',
  //     href: 'https://laravel.com/docs/starter-kits',
  //     icon: BookOpen,
  // },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to={`/track/${format(new Date(), "yyyy-MM-dd")}`}>
                <ApplicationLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
