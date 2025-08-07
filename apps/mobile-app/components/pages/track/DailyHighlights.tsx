import color from "color";
import pluralize from "pluralize";
import React from "react";
import { View, Text } from "react-native";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { api } from "@packages/backend/convex/_generated/api";

interface DailyHighlightsProps {
  date: Date;
}

const DailyHighlights = ({ date }: DailyHighlightsProps) => {
  const dateString = format(date, "yyyy-MM-dd");

  // These queries need to be added to your backend
  const habitData = useQuery(api.habits.getHabitsForDate, {
    date: dateString,
  });
  const taskData = useQuery(api.tasks.getTasksForDate, { date: dateString });
  const metricsData = useQuery(api.userMetrics.queries.getMetricsForDate, {
    date: dateString,
  });

  const isLoading =
    habitData === undefined ||
    taskData === undefined ||
    metricsData === undefined;

  const completedHabits = habitData || [];
  const completedTasks = taskData ?? 0;
  const trackedMetrics = metricsData || [];

  const isToday = format(new Date(), "yyyy-MM-dd") === dateString;
  const isEmpty =
    completedHabits.length === 0 &&
    completedTasks === 0 &&
    trackedMetrics.length === 0;

  const isEmptyToday = isEmpty && isToday;

  if (isLoading) {
    return (
      <View className="p-4 bg-gray-50 rounded-md">
        <View className="h-4 bg-gray-200 rounded w-32 mb-3" />
        <View className="h-3 bg-gray-200 rounded w-full mb-2" />
        <View className="h-3 bg-gray-200 rounded w-3/4" />
      </View>
    );
  }

  if (isEmpty && !isToday) {
    return (
      <View className="bg-gray-50 rounded-md py-6">
        <Text className="text-center text-gray-400 text-sm">
          No activity recorded on this day
        </Text>
      </View>
    );
  }

  if (isEmptyToday) {
    return (
      <View className="bg-gray-50 rounded-md py-6">
        <Text className="text-center text-gray-400 text-sm">
          No activity recorded today
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-gray-50 rounded-md flex flex-col gap-1 p-4">
      {completedHabits.length > 0 && (
        <View className="flex gap-2">
          <Text className="font-semibold text-xs">Habits</Text>
          <View className="flex-row flex-wrap gap-1">
            {completedHabits.map((habit, index) => {
              return (
                <View
                  key={`habit-${index}`}
                  className="px-3 py-1 rounded-md bg-red-100"
                  style={{
                    backgroundColor: color(habit.colour).lighten(0.2).hex(),
                  }}
                >
                  <Text
                    className="text-gray-600 text-sm font-semibold"
                    style={{
                      color: color(habit.colour).darken(0.9).hex(),
                    }}
                  >
                    {habit.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
      {trackedMetrics.length > 0 && (
        <View className="flex gap-2">
          <Text className="font-semibold text-xs">Tracked</Text>
          <View className="flex-row flex-wrap gap-1">
            {trackedMetrics.map((metric, index) => {
              return (
                <View
                  key={`metric-${index}`}
                  className="px-3 py-1 rounded-md"
                  style={{
                    backgroundColor: color(metric.colour).lighten(0.2).hex(),
                  }}
                >
                  <Text
                    className="text-gray-600 text-sm font-semibold"
                    style={{
                      color: color(metric.colour).darken(0.9).hex(),
                    }}
                  >
                    {metric.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
      {completedTasks > 0 && (
        <View className="mt-2">
          <Text className="text-center text-sm px-2 py-1 rounded-md bg-gray-200">
            Completed <Text className="font-semibold">{completedTasks}</Text>{" "}
            {pluralize("task", completedTasks)}
          </Text>
        </View>
      )}
    </View>
  );
};

export default DailyHighlights;
