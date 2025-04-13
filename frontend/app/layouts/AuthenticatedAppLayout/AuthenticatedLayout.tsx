import { gql, useQuery } from "@apollo/client";
import AppLayoutTemplate from "./AppWithSidebarLayout";
import { useEffect, type ReactNode } from "react";
import { Outlet, useNavigate } from "react-router";
import type { BreadcrumbItem } from "~/types";
import { ROOT_APP_QUERY } from "~/lib/globalQueries";
import FullscreenSpinner from "~/components/FullscreenSpinner";

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
  const navigate = useNavigate();
  const { data, loading } = useQuery(ROOT_APP_QUERY);

  const navigateToLogin = () => {
    navigate("/login");
  };

  useEffect(() => {
    if (!loading && data?.viewer?.user == null) {
      navigateToLogin();
    }
  }, [loading, data]);

  if (loading) {
    return <FullscreenSpinner />;
  }

  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
      <Outlet />
    </AppLayoutTemplate>
  );
};
