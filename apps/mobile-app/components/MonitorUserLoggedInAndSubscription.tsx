import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

export default function MonitorUserLoggedInAndSubscription() {
  const router = useRouter();
  const segments = useSegments(); // tells you the current route segments
  const user = useQuery(api.auth.viewer);
  const isLoading = user === undefined;

  useEffect(() => {
    if (!isLoading) {
      if (user === null) {
        const segs = [...segments] as string[];
        const isOnHomePage = segs.length === 0 || segs[0] === "index";

        if (!isOnHomePage) {
          router.replace("/"); // kick them to home if logged out
        }
      } else if (
        user !== null &&
        !user?.isSubscribed &&
        !user?.hasLifetimeAccess
      ) {
        const segs = [...segments] as string[];

        const isOnOnboardingPage = segs.includes("onboarding");
        const isOnSubscribePage = segs.includes("subscribe");
        const isOnHomePage = segs.length === 0 || segs[0] === "index";

        if (!isOnOnboardingPage && !isOnSubscribePage && !isOnHomePage) {
          router.replace("/subscribe");
        }
      }
    }
  }, [user, segments, router]);

  return null;
}
