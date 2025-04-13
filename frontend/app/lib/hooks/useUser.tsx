import { useSuspenseQuery } from "@apollo/client";
import type { User } from "~/types";
import { ROOT_APP_QUERY } from "../globalQueries";

export function useUser() {
  const { data } = useSuspenseQuery<{ viewer: { user: User | null } }>(
    ROOT_APP_QUERY
  );

  return data?.viewer?.user;
}
