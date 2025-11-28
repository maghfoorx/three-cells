import color from "color";
import pluralize from "pluralize";
import React from "react";
import { View, Text } from "react-native";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { api } from "@packages/backend/convex/_generated/api";

interface DailyHighlightsProps {
  dateString: string;
}

const DailyHighlights = ({ dateString }: DailyHighlightsProps) => {
  const habitData = useQuery(api.habits.getHabitsForDate, { date: dateString });
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

  if (isLoading) {
    return (
      <View className="bg-gray-50 rounded-md p-4">
        <View className="h-4 bg-gray-200 rounded w-32 mb-2" />
        <View className="h-3 bg-gray-200 rounded w-full" />
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View className="bg-gray-50 rounded-md p-6 items-center">
        <Text className="text-gray-400 text-sm">
          {isToday
            ? "No activity recorded today"
            : "No activity recorded on this day"}
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-gray-50 rounded-md p-4">
      {completedHabits.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Habits completed
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {completedHabits.map((habit, index) => (
              <View
                key={`habit-${index}`}
                className="px-3 py-1 rounded-md"
                style={{
                  backgroundColor: color(habit.colour).lighten(0.25).hex(),
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{
                    color: color(habit.colour).darken(0.9).hex(),
                  }}
                >
                  {habit.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {trackedMetrics.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Tracked
          </Text>

          <View className="rounded-md overflow-hidden">
            {trackedMetrics.map((metric, index) => (
              <View
                key={`metric-${index}`}
                className="flex-row items-center"
                style={{
                  backgroundColor: color(metric.colour).lighten(0.25).hex(),
                }}
              >
                {/* Left column: Name */}
                <View
                  style={{
                    width: 200,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color: color(metric.colour).darken(0.9).hex(),
                    }}
                    numberOfLines={1}
                  >
                    {metric.name}
                  </Text>
                </View>

                {/* Right column: Value + Unit */}
                <View
                  style={{ flex: 1, alignItems: "flex-end", paddingRight: 12 }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{
                      color: color(metric.colour).darken(0.9).hex(),
                    }}
                  >
                    {metric.value} {metric.unit}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {completedTasks > 0 && (
        <View>
          <Text className="text-sm text-gray-700">
            Completed <Text className="font-semibold">{completedTasks}</Text>{" "}
            {pluralize("task", completedTasks)}
          </Text>
        </View>
      )}
    </View>
  );
};

export default DailyHighlights;
