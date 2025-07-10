import { useConvexAuth } from "convex/react";
import { Redirect } from "expo-router";
import React from "react";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (!isAuthenticated && !isLoading) {
    return <Redirect href={"/"} />;
  }

  return <React.Fragment>{children}</React.Fragment>;
}
