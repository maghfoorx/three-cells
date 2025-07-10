import React from "react";
import { Image } from "expo-image";
import { View, Text, SafeAreaView, ScrollView } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import SignOutButton from "@/components/SignOutButton";
import { CakeIcon } from "react-native-heroicons/solid";

export default function AccountPage() {
  const user = useQuery(api.auth.viewer);

  const hasLifeTimeAccess =
    (user != null &&
      user.hasActivePurchase != null &&
      user.hasActivePurchase) ??
    false;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Account</Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex gap-4 bg-gray-100 rounded-md py-4 px-4">
            <View className="flex flex-row gap-4 items-center">
              <Image
                source={{ uri: user?.image }}
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
              <View>
                <Text className="font-semibold text-lg">{user?.name}</Text>
                <Text>{user?.email}</Text>
              </View>
            </View>

            <View>
              <SignOutButton />
            </View>
          </View>
          {hasLifeTimeAccess && (
            <View className="px-4 py-4 bg-green-300 mt-4 rounded-md">
              <View className="flex flex-row gap-1 items-center">
                <CakeIcon color={"black"} size={24} />
                <Text className="text-xl font-semibold">Lifetime access</Text>
              </View>
              <Text className="mt-2">
                You have full access to all features of three cells!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
