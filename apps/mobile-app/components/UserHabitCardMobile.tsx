import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  startOfDay,
  endOfDay,
} from "date-fns";
import color from "color";
import { useMutation, useQuery } from "convex/react";
import { CheckIcon, XMarkIcon } from "react-native-heroicons/outline";
import { useMemo, useState, useCallback } from "react";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { api } from "@packages/backend/convex/_generated/api";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeTouchEvent,
} from "react-native";
import { Link, router } from "expo-router";
import { handleHookMutationError } from "@/utils/handleHookMutationError";

export function UserHabitCard({
  habit,
}: {
  habit: DataModel["userHabits"]["document"];
}) {
  const { start, end, dates } = useMemo(() => {
    const rawEnd = new Date();
    const rawStart = addDays(rawEnd, -6);
    const dates = Array.from({ length: 7 }, (_, i) => addDays(rawStart, i));
    return {
      start: startOfDay(rawStart),
      end: endOfDay(rawEnd),
      dates,
    };
  }, []);

  const submissionsForHabit = useQuery(api.habits.getSubmissionsForHabit, {
    habitId: habit._id,
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  });

  return (
    <Pressable
      onPress={() => {
        router.push(`/habits/${habit._id}`);
      }}
      className="rounded-md p-6 border border-gray-200"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        backgroundColor: color(habit.colour).mix(color("white"), 0.85).hex(),
      }}
    >
      {/* Header */}
      <View className="flex flex-row gap-2 items-center mb-2">
        <View
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: habit.colour }}
        />
        <Text className="text-lg font-semibold text-gray-900">
          {habit.name}
        </Text>
      </View>

      {/* Week Grid */}
      <View className="flex flex-row justify-between gap-2 mb-6">
        {dates.map((date) => {
          return (
            <HabitDateButton
              key={date.getTime()}
              habitId={habit._id}
              date={date}
              submissions={submissionsForHabit?.lastXDaysSubmissions}
            />
          );
        })}
      </View>

      {/* Stats */}
      {submissionsForHabit?.currentMonthPerformancePercentage != null &&
        submissionsForHabit?.lastXDaysSubmissions != null && (
          <View className="flex flex-row justify-between items-center pt-4 border-t border-gray-100">
            <Text className="text-sm text-gray-500">
              {submissionsForHabit?.lastXDaysSubmissions?.length}/{dates.length}{" "}
              days this week
            </Text>
            <View className="flex flex-row items-center gap-2">
              <Text className="text-sm font-medium text-gray-900">
                {submissionsForHabit?.currentMonthPerformancePercentage}%
              </Text>
              <Text className="text-sm text-gray-500">this month</Text>
            </View>
          </View>
        )}
    </Pressable>
  );
}

type HabitDateButtonProps = {
  date: Date;
  habitId: DataModel["userHabits"]["document"]["_id"];
  submissions?: DataModel["userHabitSubmissions"]["document"][];
};

const HabitDateButton = ({
  date,
  habitId,
  submissions,
}: HabitDateButtonProps) => {
  const [isToggling, setIsToggling] = useState(false);

  const toggleYesNoHabitSubmission = useMutation(
    api.habits.toggleYesNoHabitSubmission,
  );

  const toggleSubmission = useCallback(
    async (event: NativeSyntheticEvent<NativeTouchEvent>) => {
      event.stopPropagation();
      setIsToggling(true);

      try {
        const formattedDate = format(date, "yyyy-MM-dd");
        await toggleYesNoHabitSubmission({ habitId, dateFor: formattedDate });
      } catch (err) {
        handleHookMutationError(err);
      } finally {
        setIsToggling(false);
      }
    },
    [date, habitId, toggleYesNoHabitSubmission],
  );

  const isChecked = submissions?.some((s) =>
    isSameDay(new Date(s.dateFor), date),
  );

  // Check if submissions data is still loading
  const isLoadingSubmissions = submissions === undefined;

  return (
    <View className="flex flex-col items-center flex-1">
      <Text className="text-xs font-medium text-gray-500 mb-1">
        {format(date, "EEE")}
      </Text>
      <Text className="text-xs text-gray-400 mb-2">{format(date, "d")}</Text>

      <TouchableOpacity
        className={`w-10 h-10 rounded-md items-center justify-center ${
          isLoadingSubmissions
            ? "bg-gray-50 border-2 border-gray-200"
            : isChecked
              ? "bg-green-50 border-2 border-green-200"
              : "bg-red-50 border-2 border-red-100"
        }`}
        onPress={toggleSubmission}
        disabled={isToggling || isLoadingSubmissions}
        activeOpacity={0.7}
      >
        {isToggling || isLoadingSubmissions ? (
          <ActivityIndicator size="small" color="#6B7280" />
        ) : isChecked ? (
          <CheckIcon size={16} color="#16A34A" />
        ) : (
          <XMarkIcon size={16} color="red" />
        )}
      </TouchableOpacity>
    </View>
  );
};

UserHabitCard.Skeleton = (() => {
  return (
    <View className="bg-white rounded-md p-6 border border-gray-100">
      <View className="flex flex-row items-center gap-3 mb-6">
        <View className="w-4 h-4 rounded-full bg-gray-300" />
        <View className="h-5 w-32 bg-gray-300 rounded" />
      </View>

      <View className="flex flex-row justify-between gap-2 mb-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} className="flex-1 items-center">
            <View className="h-3 w-8 bg-gray-300 rounded mb-1" />
            <View className="h-3 w-4 bg-gray-300 rounded mb-2" />
            <View className="w-10 h-10 bg-gray-300 rounded-md" />
          </View>
        ))}
      </View>

      <View className="flex flex-row justify-between items-center pt-4 border-t border-gray-100">
        <View className="h-4 w-24 bg-gray-300 rounded" />
        <View className="h-4 w-20 bg-gray-300 rounded" />
      </View>
    </View>
  );
}) as React.FC;

export default UserHabitCard;
