import { router } from "expo-router";
import { MotiView, AnimatePresence } from "moti";
import { Layout } from "react-native-reanimated";
import { XMarkIcon } from "react-native-heroicons/outline";
import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import color from "color";
import { api } from "@packages/backend/convex/_generated/api";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { SCORE_COLORS } from "@/utils/types";
import clsx from "clsx";
import { SafeAreaView } from "react-native-safe-area-context";

type SortOption = "latest" | "score";

export default function TrackLogPage() {
  return (
    <SafeAreaView className="flex-1">
      <View className="py-4 flex-grow">
        <View className="px-4 pt-2 flex flex-row items-center justify-between">
          <View className="w-6" />
          <Text className="text-xl font-semibold text-gray-900">Log</Text>

          <Pressable onPress={router.back}>
            <XMarkIcon size={24} color="#374151" />
          </Pressable>
        </View>

        <View className="flex-1 mt-4">
          <ThreeCellLogView />
        </View>
      </View>
    </SafeAreaView>
  );
}

const sortOptions: SortOption[] = ["latest", "score"];
const sortLabels: Record<SortOption, string> = {
  latest: "LATEST",
  score: "SCORE",
};

function ThreeCellLogView() {
  const allThreeCellEntries = useQuery(api.threeCells.allThreeCellEntries);
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const handleSortChange = (value: SortOption) => {
    const index = sortOptions.indexOf(value);
    setSortBy(value);
  };

  const sortedLogs = useMemo(() => {
    if (!allThreeCellEntries) return [];
    const logs = allThreeCellEntries;
    switch (sortBy) {
      case "score":
        return logs.sort((a, b) => b.score - a.score);
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
      <View className="flex-row justify-between items-center">
        <View className="relative h-8 rounded-md bg-gray-100 flex-row">
          {sortOptions.map((option, idx) => (
            <Pressable
              key={option}
              onPress={() => handleSortChange(option)}
              className="w-20 h-8 items-center justify-center bg-gray-200"
            >
              <Text
                className={clsx("text-xs", {
                  "font-bold": sortBy === option,
                })}
              >
                {sortLabels[option]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Log Entries */}
      <ScrollView className="flex-1 mt-4" showsVerticalScrollIndicator={false}>
        <AnimatePresence>
          {sortedLogs.map((entry: DataModel["three_cells"]["document"]) => {
            const baseColor = SCORE_COLORS[entry.score.toString()] ?? "#ffffff";
            const bg = color(baseColor).fade(0.7).rgb().string();

            return (
              <MotiView
                key={entry._id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -10 }}
                transition={{ type: "timing", duration: 300 }}
                layout={Layout.duration(200)}
              >
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
                    <Text className="text-xs text-gray-500">
                      ({entry.score})
                    </Text>
                  </View>
                  <Text className="text-sm text-gray-700 mt-2 leading-5">
                    {entry.summary}
                  </Text>
                </Pressable>
              </MotiView>
            );
          })}
        </AnimatePresence>
      </ScrollView>
    </View>
  );
}
