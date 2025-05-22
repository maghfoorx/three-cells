import { Authenticated, Unauthenticated } from "convex/react";
import AppLayoutTemplate from "./AppWithSidebarLayout";
import { type ReactNode } from "react";
import { Link, Navigate, Outlet } from "react-router";
import type { BreadcrumbItem } from "~/types";
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
  return (
    <>
      <Authenticated>
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
          <Outlet />
        </AppLayoutTemplate>
      </Authenticated>
      <Unauthenticated>
        <Navigate to="/login" replace />
      </Unauthenticated>
    </>
  );
};
