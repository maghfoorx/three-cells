import { Image } from "expo-image";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import SignOutButton from "@/components/SignOutButton";
import { HeartIcon } from "react-native-heroicons/solid";
import NotificationSettings from "@/components/pages/account/NotificationSettings";
import LoadingScreen from "@/components/LoadingScreen";
import { router } from "expo-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function AccountPage() {
  const user = useQuery(api.auth.viewer);

  const hasLifetimeAccess = user?.hasLifetimeAccess === true;
  const hasActiveSubscription = user?.isSubscribed === true;
  const deleteAccount = useMutation(api.auth.deleteUserAccount);

  const { signOut } = useAuthActions();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Deleting your account will permanently erase your data. Any active subscription will remain active and must be managed through the Apple App Store.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              router.replace("/logged-out");
              await deleteAccount();
              // Optionally sign the user out or redirect after deletion
            } catch (error) {
              console.error("Failed to delete account:", error);
            }
          },
        },
      ],
    );
  };

  const isEmailHiddenByApple = user?.email?.includes(
    "@privaterelay.appleid.com",
  );

  const isLoading = user === undefined;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">Account</Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* User Profile Section */}
          <View className="flex gap-4 bg-gray-100 rounded-md py-4 px-4">
            <View className="flex flex-row gap-4 items-center">
              {user?.image != null && (
                <Image
                  source={{ uri: user?.image }}
                  style={{ width: 50, height: 50, borderRadius: 25 }}
                />
              )}
              <View>
                <Text className="font-semibold text-lg">{user?.name}</Text>
                {!isEmailHiddenByApple && user?.email != null && (
                  <Text>{user?.email}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Subscription Section */}
          {hasLifetimeAccess && (
            <View className="px-4 py-4 bg-green-300 mt-4 rounded-md">
              <View className="flex flex-row gap-1 items-center">
                <HeartIcon color={"red"} size={24} />
                <Text className="text-xl font-semibold">Lifetime Access</Text>
              </View>
              <Text className="mt-2">
                You have full access to all features of Three Cells forever! 🎉
              </Text>
            </View>
          )}

          {hasActiveSubscription && (
            <View className="px-4 py-4 bg-yellow-100 mt-4 rounded-md">
              <Text className="text-xl font-semibold mb-2">Subscribed</Text>
              <Text className="mb-4">
                You are currently subscribed to three cells and have access to
                all features!
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // RevenueCat doesn’t provide direct cancel method
                  Linking.openURL(
                    "https://apps.apple.com/account/subscriptions",
                  );
                }}
                className="bg-blue-400 py-3 px-4 rounded-md"
              >
                <Text className="text-white font-semibold text-center">
                  Manage Subscription
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!hasActiveSubscription && !hasLifetimeAccess && !isLoading && (
            <View className="px-4 py-4 bg-yellow-100 mt-4 rounded-md">
              <Text className="text-xl font-semibold mb-2">
                No Subscription
              </Text>
              <Text className="mb-4">
                You are not currently subscribed to any plan.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  router.replace("/subscribe");
                }}
                className="bg-blue-400 py-3 px-4 rounded-md"
              >
                <Text className="text-white font-semibold text-center">
                  Get access to Three Cells
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Notifications Section */}
          <NotificationSettings className="mt-4" />

          <View className="px-4 py-4 bg-blue-50 mt-4 rounded-md">
            <Text className="text-xl font-semibold mb-2">Contact Us</Text>
            <Text className="mb-4">
              Have questions or need support? Reach out to us at{" "}
              <Text className="underline text-blue-700">
                hello@three-cells.com
              </Text>
              .
            </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL("mailto:hello@three-cells.com")}
              className="bg-blue-400 py-3 px-4 rounded-md"
            >
              <Text className="text-white font-semibold text-center">
                Send Email
              </Text>
            </TouchableOpacity>
          </View>

          <ExportYourDataSection />

          {/* Danger Zone */}
          <View className="px-4 py-4 bg-red-50 mt-8 rounded-md border border-red-300">
            <Text className="text-xl font-semibold text-red-700 mb-2">
              Danger Zone
            </Text>
            <Text className="mb-4 text-red-600">
              Deleting your account will permanently erase your data. Any active
              subscription will remain active and must be managed through the
              Apple App Store.
            </Text>
            <TouchableOpacity
              onPress={handleDeleteAccount}
              className="bg-red-600 py-3 px-4 rounded-md"
            >
              <Text className="text-white font-semibold text-center">
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <View className="mt-4">
            <SignOutButton />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const ExportYourDataSection = () => {
  const [loading, setLoading] = useState(false);
  const exportUserData = useMutation(api.auth.exportUserData);

  const handleDownload = async () => {
    try {
      setLoading(true);

      const data = await exportUserData();

      // Combine all three datasets into one CSV string
      const combinedCsv = [
        "=== Three Cells Submissions ===",
        data.threeCellsCsv,
        "\n=== Habit Submissions ===",
        data.habitCsv,
        "\n=== Metric Submissions ===",
        data.metricCsv,
      ].join("\n\n");

      // Use timestamp + random suffix to ensure unique filename
      const time = new Date().toISOString().replace(/[:.]/g, "-");
      const randomSuffix = Math.floor(Math.random() * 10000);

      const fileName = `three_cells_exported_data_${time}_${randomSuffix}.csv`;

      // Create and write the file using the new File API
      const file = new FileSystem.File(FileSystem.Paths.document, fileName);
      file.create();
      file.write(combinedCsv);

      // Open the share sheet
      await Sharing.shareAsync(file.uri);
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="px-4 py-4 bg-green-50 mt-4 rounded-md">
      <Text className="text-xl font-semibold mb-2">Export Data</Text>
      <Text className="mb-4">Export your data in CSV format</Text>
      <TouchableOpacity
        onPress={handleDownload}
        className={"py-3 px-4 rounded-md bg-green-400"}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="green" />
        ) : (
          <Text className="font-semibold text-center">Download</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
