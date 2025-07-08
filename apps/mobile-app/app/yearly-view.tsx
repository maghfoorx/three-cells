import React from "react";
import { View, Text, Pressable } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarView from "@/components/pages/yearly-view/CalendarView";
import { CalendarIcon, ChevronDownIcon } from "react-native-heroicons/outline";
import { router } from "expo-router";

export default function CalendarViewPage() {
  const allThreeCellEntries = useQuery(api.threeCells.allThreeCellEntries);
  const currentYear = new Date().getFullYear();

  return (
    <SafeAreaView className="flex-1 px-6">
      <View className="py-4 flex flex-row items-center justify-between">
        <View>
          <Pressable onPress={router.back}>
            <Text>
              <ChevronDownIcon size={20} />
            </Text>
          </Pressable>
        </View>
        <View className="flex flex-row items-left gap-2">
          <View className="bg-green-300 px-2 py-1 rounded-sm flex flex-row gap-1 items-center">
            <CalendarIcon size={20} />
            <Text className="font-semibold text-gray-800">{currentYear}</Text>
          </View>
        </View>
      </View>

      <View>
        <CalendarView allThreeCellEntries={allThreeCellEntries} />
      </View>
    </SafeAreaView>
  );
}
