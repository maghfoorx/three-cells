import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { UserInfo } from "~/components/UserInfo";
import { UserMenuContent } from "./UserMenuContent";
import { useIsMobile } from "~/lib/hooks/useIsMobile";
import { ChevronsUpDown } from "lucide-react";
import { useUser } from "~/lib/hooks/useUser";

export function NavUser() {
  const user = useUser();
  const { state } = useSidebar();
  const isMobile = useIsMobile();

  if (user != null) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group"
              >
                <UserInfo user={user} />
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="end"
              side={
                isMobile ? "bottom" : state === "collapsed" ? "left" : "bottom"
              }
            >
              <UserMenuContent user={user} />
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }
}
