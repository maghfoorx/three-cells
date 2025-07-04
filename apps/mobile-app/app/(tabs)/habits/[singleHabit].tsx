import { useLocalSearchParams } from "expo-router";
import { parse, isValid } from "date-fns";
import ThreeCellDailyForm from "@/components/ThreeCellDailyFormMobile";
import { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { SafeAreaView, Text, View } from "react-native";
import SubmissionsCalendarHeatmapMobile from "@/components/SubmissionsHeatmapMobile";
import { BulkManageToast } from "@/components/useCalendarSquareToast";

export default function SingleHabitPage() {
  const { singleHabit: singleHabitId } = useLocalSearchParams();

  const habitId = singleHabitId as DataModel["userHabits"]["document"]["_id"];

  const singleHabit = useQuery(api.habits.getAllSubmissionsForHabit, {
    habitId: habitId,
  });

  if (singleHabit === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="p-4 flex-grow">
          <View className="flex flex-row justify-between">
            <View className="items-left">
              <Text className="text-2xl font-bold text-gray-800">Habit</Text>
            </View>
          </View>
          <View className="mt-4 flex gap-2">
            <Text>Loading...</Text>
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
              {singleHabit.habit.name}
            </Text>
          </View>
        </View>
        <View className="mt-4 flex gap-2">
          <Text className="px-4">Single habit page</Text>
          <SubmissionsCalendarHeatmapMobile
            allSubmissions={singleHabit.allSubmissions}
            habit={singleHabit.habit}
          />
        </View>
      </View>
      <BulkManageToast habit={singleHabit?.habit ?? null} />
    </SafeAreaView>
  );
}
