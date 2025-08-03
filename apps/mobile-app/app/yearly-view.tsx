import React from "react";
import { View, Text, Pressable } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarView from "@/components/pages/yearly-view/CalendarView";
import {
  CalendarIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "react-native-heroicons/outline";
import { router } from "expo-router";

export default function CalendarViewPage() {
  const allThreeCellEntries = useQuery(api.threeCells.allThreeCellEntries);
  const currentYear = new Date().getFullYear();

  return (
    <SafeAreaView className="flex-1">
      <View className="py-4 flex-grow">
        <View className="px-4 pt-2 flex flex-row items-center justify-between">
          <View className="flex flex-row items-left gap-2">
            <View className="flex flex-row gap-1 items-center">
              <CalendarIcon size={24} color="#374151" />
              <Text className="font-semibold text-gray-800">{currentYear}</Text>
            </View>
          </View>
          <Text className="text-xl font-semibold text-gray-900">
            Yearly view
          </Text>

          <Pressable onPress={router.back}>
            <XMarkIcon size={24} color="#374151" />
          </Pressable>
        </View>

        <View className="mt-4 px-4">
          <CalendarView allThreeCellEntries={allThreeCellEntries} />
        </View>
      </View>
    </SafeAreaView>
  );
}
