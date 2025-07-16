import React from "react";
import { View, Text, SafeAreaView, ScrollView, Pressable } from "react-native";
import { PlusIcon } from "react-native-heroicons/outline";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import UserHabitCardMobile from "@/components/UserHabitCardMobile";
import { router } from "expo-router";

export default function HabitsPage() {
  const allUserMetrics = useQuery(api.habits.getAllUserHabits);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex flex-row justify-between items-center bg-white">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Habits</Text>
            <Text className="text-base text-gray-500 mt-1">
              {allUserMetrics?.length || 0} active Metrics
            </Text>
          </View>

          <Pressable
            onPress={() => router.navigate("/create-new-habit")}
            className="w-12 h-12 rounded-md bg-white/80 items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <PlusIcon size={20} color="#6B7280" />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 32,
          }}
        ></ScrollView>
      </View>
    </SafeAreaView>
  );
}
