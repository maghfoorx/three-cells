import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { type NavItem } from "~/types";
import { type ComponentPropsWithoutRef } from "react";
import { Icon } from "~/components/Icon";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { Check } from "lucide-react";

export function NavFooter({
  items,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
  items: NavItem[];
}) {
  const viewer = useQuery(api.auth.viewer);

  const hasLifeTimeAccess =
    (viewer != null &&
      viewer.hasActivePurchase != null &&
      viewer.hasActivePurchase) ??
    false;

  return (
    <SidebarGroup
      {...props}
      className={`group-data-[collapsible=icon]:p-0 ${className || ""}`}
    >
      <SidebarGroupContent>
        {hasLifeTimeAccess && (
          <div className="bg-linear-30 from-white to-blue-300 rounded-md px-4 py-2">
            <div className="font-semibold flex flex-row gap-1 items-center">
              <Check size={16} /> <span>Lifetime Access</span>
            </div>
            <div>You have full access to all features of three cells</div>
          </div>
        )}
        <SidebarMenu className="mt-2">
          {items.map((item) => {
            if ("title" in item) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
                  >
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.icon && (
                        <Icon iconNode={item.icon} className="h-5 w-5" />
                      )}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
