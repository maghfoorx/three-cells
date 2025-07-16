import { useLocalSearchParams } from "expo-router";
import { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { SafeAreaView, Text, View } from "react-native";
import SubmissionsCalendarHeatmapMobile from "@/components/SubmissionsHeatmapMobile";
import { BulkManageToast } from "@/components/useCalendarSquareToast";
import { Feather } from "@expo/vector-icons";

export default function SingleMetricPage() {
  const { singleMetric: singleMetricId } = useLocalSearchParams();

  const metricId = singleMetricId as DataModel["userHabits"]["document"]["_id"];

  const singleMetric = useQuery(api.habits.getAllSubmissionsForHabit, {
    habitId: metricId,
  });

  if (singleMetric === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="p-4 flex-grow">
          <View className="flex flex-row justify-between">
            <View className="items-left">
              <Text className="text-2xl font-bold text-gray-800">Metric</Text>
            </View>
          </View>
          <View className="mt-4 items-center justify-center">
            <Feather name="loader" size={24} color="gray" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="py-4 flex-grow">
        <View className="px-4 flex flex-row justify-between">
          <View className="items-left">
            <Text className="text-2xl font-bold text-gray-800">
              Single metric name
            </Text>
          </View>
        </View>
        <View className="mt-4 flex gap-2"></View>
      </View>
    </SafeAreaView>
  );
}
