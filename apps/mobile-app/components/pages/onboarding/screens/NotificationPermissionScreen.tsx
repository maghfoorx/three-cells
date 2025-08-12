import { useState, useEffect } from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import { BellIcon } from "react-native-heroicons/solid";
import * as Notifications from "expo-notifications";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import ProgressIndicator from "../ProgressIndicator";

interface NotificationPermissionScreenProps {
  onNext: () => void;
}

export default function NotificationPermissionScreen({
  onNext,
}: NotificationPermissionScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    try {
      const result = await Notifications.getPermissionsAsync();
      setPermissionGranted(result.status === "granted");
    } catch (error) {
      console.error("Error checking notification permissions:", error);
    }
  };

  const requestNotificationPermissions = async () => {
    setIsLoading(true);

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === "granted";
      setPermissionGranted(granted);

      if (granted) {
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
          "Perfect! 🎉",
          "You'll receive gentle reminders to help you stay consistent with your habits and journaling.",
        );
      } else {
        Alert.alert(
          "No Problem!",
          "You can always enable notifications later in your device settings if you change your mind.",
        );
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      Alert.alert(
        "Error",
        "There was an error with notifications. You can continue without them for now.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip Notifications?",
      "Gentle reminders can increase habit consistency by up to 40%. Are you sure you want to skip?",
      [
        {
          text: "Enable Notifications",
          style: "default",
          onPress: requestNotificationPermissions,
        },
        { text: "Skip for Now", style: "cancel", onPress: onNext },
      ],
    );
  };

  return (
    <OnboardingContainer backgroundColor="#fef7ff">
      <View className="flex-1 px-6">
        <ProgressIndicator currentStep={9} totalSteps={12} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-center">
            <View className="items-center mb-8">
              <View className="bg-purple-100 rounded-full p-8 mb-6">
                <BellIcon color="#7c3aed" size={48} />
              </View>

              <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
                Stay on Track
              </Text>

              <Text className="text-lg text-gray-600 text-center leading-relaxed mb-8">
                Gentle reminders can make all the difference in building lasting
                habits. We'll send you encouraging notifications at just the
                right moments.
              </Text>
            </View>

            <View className="flex gap-4">
              <View className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  📱 Smart Reminders
                </Text>
                <Text className="text-gray-700 leading-relaxed">
                  We'll remind you to check in with your habits, but never
                  overwhelm you. Our notifications are designed to motivate, not
                  annoy.
                </Text>
              </View>

              <View className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  🎯 Proven Results
                </Text>
                <Text className="text-gray-700 leading-relaxed">
                  Studies show that people who receive habit reminders are 40%
                  more likely to maintain their streaks and achieve their goals.
                </Text>
              </View>

              <View className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
                <Text className="text-lg font-semibold text-gray-900 mb-3">
                  ⚙️ Full Control
                </Text>
                <Text className="text-gray-700 leading-relaxed">
                  You can customize when and how often you receive
                  notifications, or turn them off completely at any time.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="pb-8 space-y-3">
          <OnboardingButton
            title={
              permissionGranted
                ? "Notifications Enabled ✓"
                : "Enable Notifications"
            }
            onPress={
              permissionGranted ? onNext : requestNotificationPermissions
            }
            icon={permissionGranted ? "check" : "bell"}
            loading={isLoading}
          />

          {!permissionGranted && (
            <OnboardingButton
              title="Skip for Now"
              onPress={handleSkip}
              variant="secondary"
            />
          )}
        </View>
      </View>
    </OnboardingContainer>
  );
}
