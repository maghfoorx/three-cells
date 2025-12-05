import React, { useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { SafeAreaView } from "react-native-safe-area-context";
import CalendarView, {
  MonthData,
} from "@/components/pages/yearly-view/CalendarView";
import { XMarkIcon } from "react-native-heroicons/outline";
import { router } from "expo-router";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";

export default function CalendarViewPage() {
  const allThreeCellEntries = useQuery(api.threeCells.allThreeCellEntries);
  const currentYear = new Date().getFullYear();
  const overallViewOfYear = useQuery(api.threeCells.overallViewOfYear, {
    year: currentYear.toString(),
  });

  const [loadedMonths, setLoadedMonths] = useState<MonthData[]>(() => {
    const current = new Date();
    const currentYear = current.getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(current, i);
      const start = startOfMonth(date);
      const end = endOfMonth(start);
      const days = eachDayOfInterval({ start, end });
      const isCurrentYear = start.getFullYear() === currentYear;
      return {
        monthName: format(start, isCurrentYear ? "MMMM" : "MMMM yyyy"),
        days,
        id: format(start, "yyyy-MM"),
        monthIndex: i,
      };
    });
  });

  const loadMore = useCallback(() => {
    setLoadedMonths((prev) => {
      const lastMonthDays = prev[prev.length - 1].days;
      const lastMonthDate = lastMonthDays[0];
      const currentYear = new Date().getFullYear();

      const newMonths = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(lastMonthDate, i + 1);
        const start = startOfMonth(date);
        const end = endOfMonth(start);
        const days = eachDayOfInterval({ start, end });
        const isCurrentYear = start.getFullYear() === currentYear;
        return {
          monthName: format(start, isCurrentYear ? "MMMM" : "MMMM yyyy"),
          days,
          id: format(start, "yyyy-MM"),
          monthIndex: prev.length + i,
        };
      });

      return [...prev, ...newMonths];
    });
  }, []);

  const handleGoToToday = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    router.replace(`/track/${today}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 py-4 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            {/* Left side - Go to Today button */}
            <Pressable
              onPress={handleGoToToday}
              className="bg-blue-50 px-3 py-2 rounded-full"
            >
              <Text className="text-sm font-medium">Today</Text>
            </Pressable>

            {/* Center - Title */}
            <View className="flex-row items-center gap-2">
              <Text className="text-lg font-semibold text-gray-900">
                Calendar
              </Text>
            </View>

            {/* Right side - Close button */}
            <Pressable
              onPress={router.back}
              className="p-2 rounded-lg"
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#F3F4F6" : "transparent",
              })}
            >
              <XMarkIcon size={20} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {/* Calendar Content */}
        <View className="flex-1 bg-gray-50">
          <CalendarView
            allThreeCellEntries={allThreeCellEntries}
            months={loadedMonths}
            onEndReached={loadMore}
            overallViewOfYear={overallViewOfYear}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
