import { api } from "@packages/backend/convex/_generated/api";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";

export function useUser() {
  const user = useQuery(api.auth.viewer);

  return user as DataModel["users"]["document"];
}
