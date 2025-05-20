import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export function useUser() {
  const user = useQuery(api.auth.viewer);

  return user;
}
