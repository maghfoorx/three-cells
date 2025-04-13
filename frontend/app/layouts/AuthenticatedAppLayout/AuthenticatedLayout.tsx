import { useQuery } from "@apollo/client";
import AppLayoutTemplate from "./AppWithSidebarLayout";
import { type ReactNode } from "react";
import { Navigate, Outlet } from "react-router";
import type { BreadcrumbItem } from "~/types";
import { ROOT_APP_QUERY } from "~/lib/globalQueries";
import FullscreenSpinner from "~/components/FullscreenSpinner";
import type { Route } from "../../pages/track/+types";

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Three Cells" },
    { name: "description", content: "Three Cells description" },
  ];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
  const { data, loading } = useQuery(ROOT_APP_QUERY);

  if (loading) {
    return <FullscreenSpinner />;
  }

  if (!loading && data?.viewer?.user == null) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
      <Outlet />
    </AppLayoutTemplate>
  );
};
