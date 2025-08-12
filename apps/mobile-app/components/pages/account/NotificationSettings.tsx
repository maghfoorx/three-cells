import { useState, useEffect } from "react";
import { View, Text, Switch, Alert, Platform } from "react-native";
import { BellIcon } from "react-native-heroicons/solid";
import * as Notifications from "expo-notifications";

interface NotificationSettingsProps {
  className?: string;
}

export default function NotificationSettings({
  className,
}: NotificationSettingsProps) {
  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    try {
      const result = await Notifications.getPermissionsAsync();
      setPushNotificationsEnabled(result.status === "granted");
    } catch (error) {
      console.error("Error checking notification permissions:", error);
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  };

  const handleToggleNotifications = async () => {
    if (pushNotificationsEnabled) {
      // If notifications are currently enabled, show alert to go to settings
      Alert.alert(
        "Disable Notifications",
        "To disable notifications, please go to your device settings and turn off notifications for Three Cells.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              if (Platform.OS === "ios") {
                Alert.alert(
                  "Go to Settings",
                  "Go to Settings > Notifications > Three Cells and turn off notifications.",
                );
              }
            },
          },
        ],
      );
      return;
    }

    setIsLoading(true);

    try {
      const granted = await requestNotificationPermissions();

      if (granted) {
        setPushNotificationsEnabled(true);

        // Configure notification behavior
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
          }),
        });

        Alert.alert(
          "Notifications Enabled!",
          "You'll now receive reminders to log your progress and stay on track with your habits, todos, and journaling.",
        );
      } else {
        Alert.alert(
          "Permission Denied",
          "To receive progress reminders, please enable notifications in your device settings.",
        );
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      Alert.alert(
        "Error",
        "There was an error enabling notifications. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      className={`bg-white rounded-md px-4 py-4 shadow-sm ${className || ""}`}
    >
      <View className="flex flex-row items-center gap-2 mb-4">
        <BellIcon color="#6b7280" size={20} />
        <Text className="text-xl font-semibold text-gray-900">
          Notifications
        </Text>
      </View>

      <View className="flex flex-row justify-between items-center py-3">
        <View className="flex-1 mr-4">
          <Text className="text-base font-medium text-gray-900">
            Push Notifications
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            Get gentle reminders to log your progress, complete habits, and
            maintain your journaling streak. Stay consistent with your personal
            growth journey.
          </Text>
        </View>
        <Switch
          value={pushNotificationsEnabled}
          onValueChange={handleToggleNotifications}
          trackColor={{ false: "#d1d5db", true: "#10b981" }}
          thumbColor={pushNotificationsEnabled ? "#ffffff" : "#ffffff"}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}
