import React, { useMemo, useState, useCallback, memo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { addMonths } from "date-fns";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { Feather } from "@expo/vector-icons";
import { useBulkManageHabitSubmissions } from "./useCalendarSquareToast";
import {
  formatDate,
  generateDateWeeks,
  calculateMonthLabels,
} from "../utils/calendar";

type Submission = DataModel["userHabitSubmissions"]["document"];

interface SubmissionsCalendarHeatmapMobileProps {
  allSubmissions: Submission[];
  habit?: DataModel["userHabits"]["document"];
  startDate?: Date;
  endDate?: Date;
  className?: string;
}

// Memoized Day Cell Component - prevents re-rendering all cells when one is clicked
const DayCell = memo(
  ({
    date,
    dateStr,
    intensity,
    habitColour,
    isSelected,
    isFuture,
    isLoading,
    onPress,
  }: {
    date: Date;
    dateStr: string;
    intensity: number;
    habitColour?: string;
    isSelected: boolean;
    isFuture: boolean;
    isLoading: boolean;
    onPress: (dateStr: string) => void;
  }) => {
    const handlePress = useCallback(() => {
      onPress(dateStr);
    }, [dateStr, onPress]);

    if (isLoading) {
      return (
        <View className="h-5 w-5 items-center justify-center">
          <Feather name="loader" width={16} height={16} color="#374151" />
        </View>
      );
    }

    const dateBoxColour = intensity > 0 ? habitColour : "#EEEEEE";
    const dayNumber = date.getDate();

    if (isFuture) {
      return (
        <View
          className="h-5 w-5 border border-gray-200 rounded-sm items-center justify-center"
          style={{ backgroundColor: "#F5F5F5" }}
        >
          <Text className="text-xs text-gray-500">{dayNumber}</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        className="h-5 w-5 border border-gray-200 rounded-sm items-center justify-center"
        style={{
          backgroundColor: isSelected ? "#FFB86A" : dateBoxColour,
        }}
        onPress={handlePress}
        activeOpacity={0.6}
      >
        <Text className="text-xs font-medium text-gray-700">{dayNumber}</Text>
      </TouchableOpacity>
    );
  },
);

DayCell.displayName = "DayCell";



export default function SubmissionsCalendarHeatmapMobile({
  allSubmissions = [],
  habit,
  startDate,
  endDate = new Date(),
  className = "",
}: SubmissionsCalendarHeatmapMobileProps) {
  const {
    selectedDateStrings,
    toggleDate,
    togglingSubmission,
    handleCompleteAction,
    handleUnCompleteAction,
    clearDates,
  } = useBulkManageHabitSubmissions(habit);

  const [dateRange, setDateRange] = useState(() => ({
    start: startDate || addMonths(endDate, -12),
    end: endDate,
  }));

  // Pre-compute today once
  const today = useMemo(() => new Date().getTime(), []);

  // Create a map of submissions by date for quick lookup
  const submissionsByDate = useMemo(() => {
    const map = new Map<string, number>();
    allSubmissions.forEach((submission) => {
      const count = map.get(submission.dateFor) || 0;
      map.set(submission.dateFor, count + 1);
    });
    return map;
  }, [allSubmissions]);

  const { weekGroups, dateStrings } = useMemo(() => {
    const result = generateDateWeeks(dateRange);
    // Pre-compute date strings to avoid repeated format() calls
    const strings = new Map<number, string>();
    result.allDates.forEach((date) => {
      strings.set(date.getTime(), formatDate(date, "yyyy-MM-dd"));
    });
    return { ...result, dateStrings: strings };
  }, [dateRange]);

  const monthLabels = useMemo(
    () => calculateMonthLabels(weekGroups, formatDate),
    [weekGroups],
  );

  // Memoize navigation handlers
  const navigatePrevious = useCallback(() => {
    setDateRange((prev) => ({
      start: addMonths(prev.start, -1),
      end: addMonths(prev.end, -1),
    }));
  }, []);

  const navigateNext = useCallback(() => {
    setDateRange((prev) => ({
      start: addMonths(prev.start, 1),
      end: addMonths(prev.end, 1),
    }));
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setDateRange({
      start: addMonths(today, -12),
      end: today,
    });
  }, []);

  // Memoize toggle handler with string parameter
  const handleToggleDate = useCallback(
    (dateStr: string) => {
      toggleDate(new Date(dateStr));
    },
    [toggleDate],
  );

  const selectedCount = Object.keys(selectedDateStrings).length;
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <View className={className}>
      {/* Header with navigation */}
      <View className="px-4 flex flex-col gap-2">
        <View className="flex flex-row items-center gap-2">
          <TouchableOpacity
            onPress={navigatePrevious}
            className="h-8 w-8 border border-gray-300 rounded bg-white items-center justify-center"
          >
            <Feather
              name="chevron-left"
              width={12}
              height={12}
              color="#374151"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={navigateNext}
            className="h-8 w-8 border border-gray-300 rounded bg-white flex items-center justify-center"
          >
            <Feather
              name="chevron-right"
              width={12}
              height={12}
              color="#374151"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToToday}
            className="px-3 py-1 border border-gray-300 rounded bg-white"
          >
            <Text className="text-xs text-gray-700">Today</Text>
          </TouchableOpacity>

          <View className="bg-gray-100 px-2 py-1 rounded">
            <Text className="text-xs text-gray-600">
              {formatDate(dateRange.start, "MMM yyyy")} -{" "}
              {formatDate(dateRange.end, "MMM yyyy")}
            </Text>
          </View>
        </View>
      </View>

      {/* Calendar heatmap */}
      <View className="w-full mt-4">
        <View className="border border-gray-300 border-x-0 p-4 bg-white">
          <View className="flex flex-row">
            {/* Scrollable calendar content */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-1"
              contentOffset={{ x: 770, y: 0 }}
              removeClippedSubviews={true}
            >
              <View className="flex flex-col">
                {/* Calendar grid with month labels as first row */}
                <View className="flex flex-row gap-1">
                  {weekGroups.map((week, weekIndex) => (
                    <View key={weekIndex} className="flex flex-col gap-1">
                      {/* Month label row */}
                      <View className="h-4 w-5 items-center justify-center relative">
                        {monthLabels[weekIndex] && (
                          <View className="absolute left-0 min-w-[40px] z-10">
                            <Text className="text-xs text-gray-600 font-medium text-left">
                              {monthLabels[weekIndex]}
                            </Text>
                          </View>
                        )}
                      </View>
                      {/* Day rows */}
                      {week.map((date, dayIndex) => {
                        if (!date) {
                          return (
                            <View
                              key={`empty-${weekIndex}-${dayIndex}`}
                              className="h-5 w-5"
                            />
                          );
                        }

                        const dateTime = date.getTime();
                        const dateStr = dateStrings.get(dateTime)!;
                        const submissionCount =
                          submissionsByDate.get(dateStr) || 0;
                        const intensity = Math.min(submissionCount, 4);
                        const isSelected =
                          selectedDateStrings[dateStr] || false;
                        const isFuture = dateTime > today;

                        return (
                          <DayCell
                            key={dateTime}
                            date={date}
                            dateStr={dateStr}
                            intensity={intensity}
                            habitColour={habit?.colour}
                            isSelected={isSelected}
                            isFuture={isFuture}
                            isLoading={isSelected && togglingSubmission}
                            onPress={handleToggleDate}
                          />
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
            {/* Day labels (fixed on left) */}
            <View className="w-6 flex flex-col gap-1">
              {/* Empty space for month label row */}
              <View className="h-4 w-5" />
              {/* Day labels */}
              {dayLabels.map((day, index) => (
                <View
                  key={`${day}-${index}`}
                  className="h-5 w-5 items-center justify-center"
                >
                  <Text className="text-xs text-gray-500">{day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Legend */}
          {habit != null && habit?.type !== "yes_no" && (
            <View className="flex flex-row items-center gap-2 justify-center mt-4">
              <Text className="text-xs text-gray-600">Less</Text>
              <View className="flex flex-row gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <View
                    key={level}
                    className="h-3 w-3 border border-gray-200"
                    style={{ backgroundColor: getIntensityColorValue(level) }}
                  />
                ))}
              </View>
              <Text className="text-xs text-gray-600">More</Text>
            </View>
          )}
        </View>
      </View>

      {/* Bulk action view - shown when dates are selected */}
      {selectedCount > 0 && (
        <BulkActionPanel
          selectedCount={selectedCount}
          onClear={clearDates}
          onComplete={handleCompleteAction}
          onUncomplete={handleUnCompleteAction}
        />
      )}
    </View>
  );
}

// Get intensity color value for React Native
const getIntensityColorValue = (level: number): string => {
  const colors = [
    "#F3F4F6", // 0 - no submissions (gray-100)
    "#BBF7D0", // 1 submission (green-200)
    "#4ADE80", // 2 submissions (green-400)
    "#16A34A", // 3 submissions (green-600)
    "#166534", // 4+ submissions (green-800)
  ];
  return colors[level] || colors[0];
};



interface BulkActionPanelProps {
  selectedCount: number;
  onClear: () => void;
  onComplete: () => Promise<void>;
  onUncomplete: () => Promise<void>;
}

function BulkActionPanel({
  selectedCount,
  onClear,
  onComplete,
  onUncomplete,
}: BulkActionPanelProps) {
  const [loadingAction, setLoadingAction] = useState<
    "complete" | "uncomplete" | null
  >(null);

  const handleComplete = async () => {
    setLoadingAction("complete");
    try {
      await onComplete();
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUncomplete = async () => {
    setLoadingAction("uncomplete");
    try {
      await onUncomplete();
    } finally {
      setLoadingAction(null);
    }
  };

  const isLoading = loadingAction !== null;

  return (
    <View className="px-4 mt-4">
      <View className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <View className="flex flex-row items-center justify-between mb-3">
          <Text className="text-sm text-gray-700">
            {selectedCount} date{selectedCount > 1 ? "s" : ""} selected
          </Text>
          <TouchableOpacity onPress={onClear} disabled={isLoading}>
            <Feather name="x" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View className="flex flex-row gap-2">
          <TouchableOpacity
            className="flex-1 py-2.5 rounded-md items-center justify-center"
            style={{
              backgroundColor:
                loadingAction === "complete" || !isLoading
                  ? "#22c55e"
                  : "#9ca3af",
            }}
            onPress={handleComplete}
            disabled={isLoading}
          >
            <Text className="text-white font-medium text-sm">
              {loadingAction === "complete" ? "Loading..." : "Mark as complete"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 py-2.5 rounded-md items-center justify-center"
            style={{
              backgroundColor:
                loadingAction === "uncomplete" || !isLoading
                  ? "#ef4444"
                  : "#9ca3af",
            }}
            onPress={handleUncomplete}
            disabled={isLoading}
          >
            <Text className="text-white font-medium text-sm">
              {loadingAction === "uncomplete"
                ? "Loading..."
                : "Mark as uncomplete"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
