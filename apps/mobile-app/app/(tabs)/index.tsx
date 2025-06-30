import { useConvexAuth } from "convex/react";
import { Redirect } from "expo-router";

export default function IndexTabs() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (!isAuthenticated) {
    return <Redirect href={"/"} />;
  }
}
