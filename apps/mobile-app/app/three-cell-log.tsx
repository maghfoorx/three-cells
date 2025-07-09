import { router } from "expo-router";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { ChevronDownIcon } from "react-native-heroicons/outline";
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Pressable,
} from "react-native";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import color from "color";
import { api } from "@packages/backend/convex/_generated/api";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { SCORE_COLORS } from "@/utils/types";
import clsx from "clsx";

type SortOption = "latest" | "score" | "focused_hours";

export default function TrackLogPage() {
  return (
    <SafeAreaView className="flex-1">
      <View className="px-6 py-4 flex flex-row items-center justify-between">
        <View>
          <Pressable onPress={router.back}>
            <Text>
              <ChevronDownIcon size={20} />
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-1">
        <ThreeCellLogView />
      </View>
    </SafeAreaView>
  );
}

const sortOptions: SortOption[] = ["latest", "score", "focused_hours"];
const sortLabels: Record<SortOption, string> = {
  latest: "LATEST",
  score: "SCORE",
  focused_hours: "FOCUSED",
};

function ThreeCellLogView() {
  const allThreeCellEntries = useQuery(api.threeCells.allThreeCellEntries);
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const selectedIndex = sortOptions.indexOf(sortBy);
  const indicatorX = useSharedValue(selectedIndex * 80); // width of button

  const handleSortChange = (value: SortOption) => {
    const index = sortOptions.indexOf(value);
    indicatorX.value = withTiming(index * 80, { duration: 200 });
    setSortBy(value);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const sortedLogs = useMemo(() => {
    if (!allThreeCellEntries) return [];
    const logs = allThreeCellEntries;
    switch (sortBy) {
      case "score":
        return logs.sort((a, b) => b.score - a.score);
      case "focused_hours":
        return logs.sort((a, b) => a.focusedHours - b.focusedHours);
      case "latest":
      default:
        return logs.sort(
          (a, b) =>
            new Date(b.dateFor).getTime() - new Date(a.dateFor).getTime(),
        );
    }
  }, [allThreeCellEntries, sortBy]);

  const handleEntryPress = (dateFor: string) => {
    router.replace(`/track/${dateFor}`);
  };

  return (
    <View className="flex-1 px-6">
      {/* Sort Buttons Row */}
      <View className="flex-row justify-between items-center mt-4">
        <View className="relative h-8 rounded-md bg-gray-100 overflow-hidden flex-row">
          {sortOptions.map((option, idx) => (
            <Pressable
              key={option}
              onPress={() => handleSortChange(option)}
              className="w-20 h-8 items-center justify-center bg-gray-400"
            >
              <Text
                className={clsx("text-xs", {
                  "text-white font-bold": sortBy === option,
                })}
              >
                {sortLabels[option]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Log Entries */}
      <ScrollView className="flex-1 mt-6" showsVerticalScrollIndicator={false}>
        {sortedLogs.map((entry: DataModel["three_cells"]["document"]) => {
          const baseColor = SCORE_COLORS[entry.score.toString()] ?? "#ffffff";
          const bg = color(baseColor).fade(0.7).rgb().string();

          return (
            <Pressable
              key={entry._id}
              onPress={() => handleEntryPress(entry.dateFor)}
              className="rounded-md p-4 mb-4 shadow-sm"
              style={{ backgroundColor: bg }}
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-gray-900">
                  {format(new Date(entry.dateFor), "MMM dd, yyyy")}
                </Text>
                <Text className="text-xs text-gray-500">({entry.score})</Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1">
                {entry.focusedHours}h focused
              </Text>
              <Text className="text-sm text-gray-700 mt-2 leading-5">
                {entry.summary}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
