import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { type NavGroup } from "~/types";
import { Link, useLocation } from "react-router";

export function NavMain({ groups = [] }: { groups: NavGroup[] }) {
  const location = useLocation();

  return (
    <SidebarGroup className="px-2 py-0">
      {groups.map((group) => (
        <div key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.href === location.pathname}
                >
                  <Link to={item.href}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      ))}
    </SidebarGroup>
  );
}
