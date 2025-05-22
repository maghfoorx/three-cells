import { useMemo, useState, type PropsWithChildren } from "react";
import { AppSidebar } from "~/layouts/AuthenticatedAppLayout/AuthenticatedSidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import type { BreadcrumbItem } from "~/types";

export default function AppSidebarLayout({
  children,
  breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
  return (
    <AppShell variant="sidebar">
      <AppSidebar />
      <AppContent variant="sidebar">
        <AppSidebarHeader breadcrumbs={breadcrumbs} />
        {children}
      </AppContent>
    </AppShell>
  );
}

interface AppShellProps {
  children: React.ReactNode;
  variant?: "header" | "sidebar";
}

function AppShell({ children, variant = "header" }: AppShellProps) {
  const [isOpen, setIsOpen] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("sidebar") !== "false"
      : true
  );

  const handleSidebarChange = (open: boolean) => {
    setIsOpen(open);

    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar", String(open));
    }
  };

  if (variant === "header") {
    return <div className="flex min-h-screen w-full flex-col">{children}</div>;
  }

  return (
    <SidebarProvider
      defaultOpen={isOpen}
      open={isOpen}
      onOpenChange={handleSidebarChange}
    >
      {children}
    </SidebarProvider>
  );
}

interface AppContentProps extends React.ComponentProps<"main"> {
  variant?: "header" | "sidebar";
}

function AppContent({
  variant = "header",
  children,
  ...props
}: AppContentProps) {
  if (variant === "sidebar") {
    return <SidebarInset {...props}>{children}</SidebarInset>;
  }

  return (
    <main
      className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl"
      {...props}
    >
      {children}
    </main>
  );
}

import { Breadcrumbs } from "../../components/Breadcrumbs";
import { SidebarTrigger } from "../../components/ui/sidebar";
import { type BreadcrumbItem as BreadcrumbItemType } from "~/types";
import CreateNewTaskDialog from "~/pages/tasks/CreateNewTaskDialog";
import { useLocation } from "react-router";

function AppSidebarHeader({
  breadcrumbs = [],
}: {
  breadcrumbs?: BreadcrumbItemType[];
}) {
  const location = useLocation();

  const routeBasedButtons = useMemo(() => {
    if (location.pathname === "/tasks") {
      return <CreateNewTaskDialog />;
    }

    return null;
  }, [location.pathname]);

  return (
    <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
      <div className="flex items-center justify-between w-full">
        <SidebarTrigger className="-ml-1" />
        {/* <Breadcrumbs breadcrumbs={breadcrumbs} /> */}
        <div>{routeBasedButtons}</div>
      </div>
    </header>
  );
}
