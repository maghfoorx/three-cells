import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";

export default function UpdatePushNotificationsToken() {
  const user = useQuery(api.auth.viewer);

  const recordPushNotificationToken = useMutation(
    api.userNotifications.index.recordPushNotificationToken,
  );

  async function handleRegister() {
    try {
      const result = await Notifications.getExpoPushTokenAsync({
        projectId: "7149718a-b562-4b8a-bf57-a3105a08d58d",
      });

      if (result.data != null) {
        await recordPushNotificationToken({ token: result.data });
      }
    } catch (err) {
      console.error("Push registration failed:", err);
    }
  }

  useEffect(() => {
    if (user) {
      handleRegister();
    }
  }, [user]);

  return null;
}
