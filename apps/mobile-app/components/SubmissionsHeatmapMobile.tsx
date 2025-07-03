import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { format, isAfter, addMonths, startOfWeek, addDays } from "date-fns";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { Feather } from "@expo/vector-icons";
import { useBulkManageHabitSubmissions } from "./useCalendarSquareToast";

type Submission = DataModel["userHabitSubmissions"]["document"];

interface SubmissionsCalendarHeatmapMobileProps {
  allSubmissions: Submission[];
  habit?: DataModel["userHabits"]["document"];
  startDate?: Date;
  endDate?: Date;
  className?: string;
}

// Helper functions for date manipulation
const formatDate = (date: Date, formatStr: string): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  if (formatStr === "yyyy-MM-dd") return `${year}-${month}-${day}`;
  if (formatStr === "MMM")
    return date.toLocaleDateString("en", { month: "short" });
  if (formatStr === "MMM yyyy")
    return date.toLocaleDateString("en", { month: "short", year: "numeric" });
  if (formatStr === "MMM d, yyyy")
    return date.toLocaleDateString("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  return date.toISOString();
};

const eachDayOfInterval = (start: Date, end: Date): Date[] => {
  const dates: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

export default function SubmissionsCalendarHeatmapMobile({
  allSubmissions = [],
  habit,
  startDate,
  endDate = new Date(),
  className = "",
}: SubmissionsCalendarHeatmapMobileProps) {
  const scrollViewRef = useRef<ScrollView>(null);

  const { selectedDates, toggleDate, togglingSubmission } =
    useBulkManageHabitSubmissions({
      habit,
    });

  const [isInitialRender, setIsInitialRender] = useState(true);

  const [dateRange, setDateRange] = React.useState(() => ({
    start: startDate || addMonths(endDate, -12),
    end: endDate,
  }));

  // Create a map of submissions by date for quick lookup
  const submissionsByDate = useMemo(() => {
    const map = new Map<string, Submission[]>();
    allSubmissions.forEach((submission) => {
      const dateKey = submission.dateFor;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(submission);
    });
    return map;
  }, [allSubmissions]);

  const { allDates, weekGroups } = useMemo(
    () => generateDateWeeks(dateRange),
    [dateRange],
  );

  const monthLabels = useMemo(
    () => calculateMonthLabels(weekGroups, formatDate),
    [weekGroups],
  );

  // Navigate date range
  const navigatePrevious = () => {
    setDateRange((prev) => ({
      start: addMonths(prev.start, -1),
      end: addMonths(prev.end, -1),
    }));
  };

  const navigateNext = () => {
    setDateRange((prev) => ({
      start: addMonths(prev.start, 1),
      end: addMonths(prev.end, 1),
    }));
  };

  const goToToday = () => {
    const today = new Date();
    setDateRange({
      start: addMonths(today, -12),
      end: today,
    });
  };

  // Handle initial scroll position and updates
  useEffect(() => {
    if (!scrollViewRef.current) return;

    const scrollToEnd = () => {
      if (isInitialRender) {
        // On initial render, scroll to end immediately
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
          setIsInitialRender(false);
        }, 100);
      } else {
        // For subsequent updates, smooth scroll
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    };

    scrollToEnd();
  }, [weekGroups, dateRange, isInitialRender]);

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
        <View className="border border-x-0 p-4 bg-white">
          <View className="flex flex-row">
            {/* Scrollable calendar content */}
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-1"
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
                        // if not a date then just render an empty hidden box
                        if (!date) {
                          return (
                            <View
                              key={`empty-${weekIndex}-${dayIndex}`}
                              className="h-5 w-5"
                            />
                          );
                        }

                        const intensity = getIntensityLevel(
                          date,
                          submissionsByDate,
                        );
                        const submissions =
                          submissionsByDate.get(
                            formatDate(date, "yyyy-MM-dd"),
                          ) || [];

                        const isInBulkSelectedDates = selectedDates.find(
                          (selectedDate) => selectedDate === date,
                        );

                        if (isInBulkSelectedDates && togglingSubmission) {
                          return (
                            <View
                              className="h-5 w-5 items-center justify-center"
                              key={date.getTime()}
                            >
                              <Feather
                                name="loader"
                                width={16}
                                height={16}
                                color="#374151"
                              />
                            </View>
                          );
                        }

                        const dateBoxColour =
                          intensity > 0 ? habit?.colour : "#EEEEEE";

                        // if the date is sometime in the future render a disabled box you can't click
                        if (isAfter(date.getTime(), new Date().getTime())) {
                          return (
                            <View
                              key={date.getTime()}
                              className="h-5 w-5 border border-gray-200 rounded-sm items-center justify-center"
                              style={{
                                backgroundColor: isInBulkSelectedDates
                                  ? undefined
                                  : "#F5F5F5",
                              }}
                            >
                              <Text className="text-xs text-gray-500">
                                {format(date, "d")}
                              </Text>
                            </View>
                          );
                        }

                        return (
                          <TouchableOpacity
                            key={date.getTime()}
                            className="h-5 w-5 border border-gray-200 rounded-sm items-center justify-center"
                            style={{
                              backgroundColor: isInBulkSelectedDates
                                ? "#3B82F6" // primary color
                                : dateBoxColour,
                            }}
                            onPress={() => {
                              toggleDate(date);
                            }}
                            activeOpacity={0.6}
                          >
                            <Text className="text-xs font-medium text-gray-700">
                              {format(date, "d")}
                            </Text>
                          </TouchableOpacity>
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
    </View>
  );
}

// Get intensity level for a date (0-4 scale like GitHub)
const getIntensityLevel = (date: Date, submissionsByDate: any): number => {
  const dateKey = formatDate(date, "yyyy-MM-dd");
  const submissions = submissionsByDate.get(dateKey) || [];

  if (submissions.length === 0) return 0;
  if (submissions.length === 1) return 1;
  if (submissions.length === 2) return 2;
  if (submissions.length === 3) return 3;
  return 4; // 4 or more submissions
};

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

// utils/calendar.ts
export function generateDateWeeks(dateRange: { start: Date; end: Date }) {
  const allDates = eachDayOfInterval(dateRange.start, dateRange.end);

  const dateMap = new Map<string, Date>();
  const getKey = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  allDates.forEach((date) => dateMap.set(getKey(date), date));

  const firstDate = allDates[0];
  const lastDate = allDates[allDates.length - 1];
  // Start weeks on Monday (1) instead of Sunday (0)
  const firstWeekStart = startOfWeek(firstDate, { weekStartsOn: 1 });
  const lastWeekEnd = addDays(startOfWeek(lastDate, { weekStartsOn: 1 }), 6);

  let current = new Date(firstWeekStart);
  const weeks: (Date | null)[][] = [];

  while (current <= lastWeekEnd) {
    const week: (Date | null)[] = [];

    for (let i = 0; i < 7; i++) {
      const dayDate = addDays(current, i);
      const key = getKey(dayDate);
      week.push(
        dayDate >= firstDate && dayDate <= lastDate && dateMap.has(key)
          ? dateMap.get(key)!
          : null,
      );
    }

    weeks.push(week);
    current = addDays(current, 7);
  }

  return { allDates, weekGroups: weeks };
}

export function calculateMonthLabels(
  weekGroups: (Date | null)[][],
  formatDate: (date: Date, fmt: string) => string,
) {
  const monthLabels: (string | null)[] = [];

  weekGroups.forEach((week, weekIndex) => {
    // Check if this week contains the 1st of any month
    const firstOfMonth = week.find(
      (day) => day !== null && day.getDate() === 1,
    );

    if (firstOfMonth) {
      // This week contains the 1st of a month
      monthLabels.push(formatDate(firstOfMonth, "MMM"));
    } else {
      // This week doesn't contain the 1st of any month
      monthLabels.push(null);
    }
  });

  return monthLabels;
}
