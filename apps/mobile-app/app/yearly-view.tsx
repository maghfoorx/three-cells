import React from "react";
import { View, Text, Pressable } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarView from "@/components/pages/yearly-view/CalendarView";
import { CalendarIcon, XMarkIcon } from "react-native-heroicons/outline";
import { router } from "expo-router";
import { format } from "date-fns";

export default function CalendarViewPage() {
  const allThreeCellEntries = useQuery(api.threeCells.allThreeCellEntries);
  const currentYear = new Date().getFullYear();

  const handleGoToToday = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    router.replace(`/track/${today}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-4 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            {/* Left side - Go to Today button */}
            <Pressable
              onPress={handleGoToToday}
              className="bg-blue-50 px-3 py-2 rounded-lg"
            >
              <Text className="text-blue-700 text-sm font-medium">Today</Text>
            </Pressable>

            {/* Center - Title */}
            <View className="flex-row items-center gap-2">
              <CalendarIcon size={20} color="#374151" />
              <Text className="text-lg font-semibold text-gray-900">
                {currentYear}
              </Text>
            </View>

            {/* Right side - Close button */}
            <Pressable
              onPress={router.back}
              className="p-2 rounded-lg"
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#F3F4F6" : "transparent",
              })}
            >
              <XMarkIcon size={20} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {/* Calendar Content */}
        <View className="flex-1 bg-gray-50">
          <CalendarView allThreeCellEntries={allThreeCellEntries} />
        </View>
      </View>
    </SafeAreaView>
  );
}
