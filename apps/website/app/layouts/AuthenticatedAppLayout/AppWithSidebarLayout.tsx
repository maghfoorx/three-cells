import { useMemo, useState, type PropsWithChildren } from "react";
import { AppSidebar } from "~/layouts/AuthenticatedAppLayout/AuthenticatedSidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import type { BreadcrumbItem } from "~/types";

export default function AppSidebarLayout({
  children,
  breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
  const viewer = useQuery(api.auth.viewer);

  const hasAccess = useMemo(() => {
    return viewer?.isSubscribed || viewer?.hasLifetimeAccess;
  }, [viewer]);

  if (viewer === undefined) {
    return (
      <AppShell variant="sidebar">
        <AppSidebar />
        <AppContent variant="sidebar">
          <AppSidebarHeader breadcrumbs={breadcrumbs} />
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-2 text-center">
            <Skeleton className="h-full w-full bg-secondary" />
          </div>
        </AppContent>
      </AppShell>
    );
  }

  if (viewer === null) {
    return <Navigate to={"/login"} />;
  }

  // if user unsubscribed then show something else.
  if (!hasAccess) {
    return (
      <AppShell variant="sidebar">
        <AppSidebar />
        <AppContent variant="sidebar">
          <AppSidebarHeader breadcrumbs={breadcrumbs} />
          <div className="flex flex-col items-center justify-center gap-6 p-8 text-center">
            <h1 className="text-3xl text-gray-900 hidden md:block">
              Your best life just <span className="font-semibold">one</span>{" "}
              step <span className="italic">away</span>
            </h1>
            <BuyThreeCellsCard />
          </div>
        </AppContent>
      </AppShell>
    );
  }

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
      : true,
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
import { Link, Navigate, useLocation, useParams } from "react-router";
import CreateNewHabitDialog from "~/pages/habits/CreateNewHabitDialog";
import { Button } from "~/components/ui/button";
import { ArrowLeft, SquareArrowLeft } from "lucide-react";
import { useQuery } from "convex/react";
import FullscreenSpinner from "~/components/FullscreenSpinner";
import BuyThreeCellsButton from "~/components/BuyThreeCellsButton";
import BuyThreeCellsCard from "~/components/PriceCard";
import { api } from "@packages/backend/convex/_generated/api";
import EditHabitDialog from "~/pages/habits/EditHabitDialog";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import CreateNewMetricDialog from "~/pages/metrics/CreateNewMetricDialog";
import EditMetricDialog from "~/pages/singleMetricPage/EditMetricDialog";
import { Skeleton } from "~/components/ui/skeleton";

function AppSidebarHeader({
  breadcrumbs = [],
}: {
  breadcrumbs?: BreadcrumbItemType[];
}) {
  const location = useLocation();
  const params = useParams();

  const routeBasedActions = useMemo(() => {
    if (location.pathname === "/tasks") {
      return <CreateNewTaskDialog />;
    }

    if (location.pathname === "/habits") {
      return <CreateNewHabitDialog />;
    }

    if (location.pathname === "/metrics") {
      return <CreateNewMetricDialog />;
    }

    if (params?.habitId != null) {
      return <EditHabitDialog habitId={params.habitId as Id<"userHabits">} />;
    }

    if (params?.metricId != null) {
      return (
        <EditMetricDialog metricId={params.metricId as Id<"userMetrics">} />
      );
    }

    return null;
  }, [location.pathname]);

  const routeBasedNavigationButtons = useMemo(() => {
    if (params?.habitId != null) {
      return (
        <Link
          to={"/habits"}
          viewTransition
          className="text-xs flex flew-row items-center"
        >
          <ArrowLeft size={14} /> <span>Habits</span>
        </Link>
      );
    }
    if (params?.metricId != null) {
      return (
        <Link
          to={"/metrics"}
          viewTransition
          className="text-xs flex flew-row items-center"
        >
          <ArrowLeft size={14} /> <span>Metrics</span>
        </Link>
      );
    }
  }, [location.pathname]);

  return (
    <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-2 items-center">
          <SidebarTrigger className="-ml-1" />
          {/* <Breadcrumbs breadcrumbs={breadcrumbs} /> */}
          {routeBasedNavigationButtons}
        </div>
        <div>{routeBasedActions}</div>
      </div>
    </header>
  );
}
