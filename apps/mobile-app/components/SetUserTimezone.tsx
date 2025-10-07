import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";

export default function SetUserTimezone() {
  const user = useQuery(api.auth.viewer);

  const setUserTimezone = useMutation(api.auth.setUserTimezone);

  useEffect(() => {
    if (user && !user?.timezone) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone({
        timezoneInput: tz,
      });
    }
  }, [user, setUserTimezone]);

  return null;
}
