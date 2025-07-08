import React from "react";
import { Feather } from "@expo/vector-icons";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarView from "@/components/pages/yearly-view/CalendarView";

export default function CalendarViewPage() {
  const allThreeCellEntries = useQuery(api.threeCells.allThreeCellEntries);
  const currentYear = new Date().getFullYear();

  return (
    <SafeAreaView className="flex-1 px-2">
      <View className="flex flex-row items-left gap-2">
        <Feather name="calendar" size={28} />
        <Text className="text-2xl font-bold text-gray-800">{currentYear}</Text>
      </View>

      <CalendarView allThreeCellEntries={allThreeCellEntries} />
    </SafeAreaView>
  );
}
