import { router, useLocalSearchParams } from "expo-router";
import { XMarkIcon } from "react-native-heroicons/outline";
import { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import SubmissionsCalendarHeatmapMobile from "@/components/SubmissionsHeatmapMobile";
import { BulkManageToast } from "@/components/useCalendarSquareToast";
import { Feather } from "@expo/vector-icons";
import PerformanceGraph from "@/components/PerformanceGraph";
import StreaksView from "@/components/StreaksView";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SingleHabitPage() {
  const { singleHabit: singleHabitId } = useLocalSearchParams();

  const habitId = singleHabitId as DataModel["userHabits"]["document"]["_id"];

  const singleHabit = useQuery(api.habits.getAllSubmissionsForHabit, {
    habitId: habitId,
  });

  if (singleHabit === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="py-4 flex-grow">
          <View className="px-4 pt-2 flex flex-row items-center justify-between">
            <Pressable onPress={() => {}} disabled>
              <Feather name="settings" size={20} color="#374151" />
            </Pressable>

            <Text className="text-lg font-bold text-gray-800">Habit</Text>
            <Pressable onPress={() => router.back()}>
              <XMarkIcon size={24} color="#374151" />
            </Pressable>
          </View>
          <View className="mt-4 items-center justify-center">
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (singleHabit === null) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="p-4 flex-grow">
          <View className="px-4 pt-2 flex flex-row items-center justify-between">
            <Pressable onPress={() => {}} disabled>
              <Feather name="settings" size={20} color="#374151" />
            </Pressable>

            <Text className="text-lg font-bold text-gray-800">Habit</Text>
            <Pressable onPress={() => router.back()}>
              <XMarkIcon size={24} color="#374151" />
            </Pressable>
          </View>
          <View className="mt-4 items-center justify-center">
            <Text className="text-gray-400 text-sm">
              Could not find this habit 😢
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="py-4 flex-grow">
        <View className="px-4 py-2 flex flex-row items-center justify-between">
          <Pressable
            onPress={() => router.navigate(`/habits/edit/${singleHabitId}`)}
          >
            <Feather name="settings" size={20} color="#374151" />
          </Pressable>

          <Text className="text-lg font-bold text-gray-800">
            {singleHabit.habit.name}
          </Text>
          <Pressable onPress={() => router.back()}>
            <XMarkIcon size={24} color="#374151" />
          </Pressable>
        </View>
        <ScrollView>
          <View className="mt-6 flex gap-2">
            <SubmissionsCalendarHeatmapMobile
              allSubmissions={singleHabit.allSubmissions ?? []}
              habit={singleHabit.habit}
            />

            {/* Performance Graph */}
            <View className="">
              <PerformanceGraph
                habitId={habitId}
                habitColor={singleHabit.habit.colour}
              />
            </View>
            <View className="">
              <StreaksView
                habitId={habitId}
                habitColor={singleHabit.habit.colour}
              />
            </View>
          </View>
        </ScrollView>
      </View>
      <BulkManageToast habit={singleHabit?.habit ?? null} />
    </SafeAreaView>
  );
}
