import { NavFooter } from "./NavFooter";
import { NavMain } from "./NavMain";
import { NavUser } from "./NavUser";
import { format } from "date-fns";
import {
  Rocket,
  Table,
  Calendar,
  ClipboardList,
  ChartNoAxesCombined,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import type { NavItem, NavGroup } from "~/types";
import ApplicationLogo from "~/components/ApplicationLogo";

const DynamicTrackLink = () => {
  const location = useLocation();
  const today = format(new Date(), "yyyy-MM-dd");
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={`/track/${today}` === location.pathname}
      >
        <Link
          to={`/track/${today}`}
          viewTransition
          className="flex flex-row gap-2"
        >
          <Rocket size={16} />
          <span>Track</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const mainNavItems: NavGroup[] = [
  {
    label: "Tasks",
    items: [
      {
        title: "Tasks",
        href: "/tasks",
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "Ideal life",
    items: [
      {
        customComponent: <DynamicTrackLink />,
        href: "/track",
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
    ],
  },
  {
    label: "Habits",
    items: [
      {
        title: "Habits",
        href: "/habits",
        icon: ChartNoAxesCombined,
      },
    ],
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
        <NavMain groups={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
