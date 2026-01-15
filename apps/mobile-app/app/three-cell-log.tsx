import { router } from "expo-router";
import { MotiView, AnimatePresence } from "moti";
import { Layout } from "react-native-reanimated";
import { XMarkIcon, MagnifyingGlassIcon } from "react-native-heroicons/outline";
import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useQuery, usePaginatedQuery } from "convex/react";
import { format } from "date-fns";
import color from "color";
import { api } from "@packages/backend/convex/_generated/api";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { SCORE_COLORS } from "@/utils/types";
import clsx from "clsx";
import { SafeAreaView } from "react-native-safe-area-context";

type SortOption = "latest" | "score";

function HighlightedText({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) {
  if (!highlight.trim()) {
    return <Text className="text-sm text-gray-700 mt-2 leading-5">{text}</Text>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, "gi"));

  return (
    <Text className="text-sm text-gray-700 mt-2 leading-5">
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Text key={i} className="font-bold text-gray-900 bg-yellow-200">
            {part}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        ),
      )}
    </Text>
  );
}

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
  const {
    results: allThreeCellEntries,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.threeCells.paginatedThreeCellEntries,
    {},
    { initialNumItems: 20 },
  );

  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  const searchResults = useQuery(api.threeCells.searchEntries, {
    searchQuery: debouncedSearchText,
  });

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
  };

  const sortedLogs = useMemo(() => {
    if (!allThreeCellEntries) return [];
    const logs = [...allThreeCellEntries]; // Create a copy to sort
    switch (sortBy) {
      case "score":
        return logs.sort((a, b) => b.score - a.score);
      case "latest":
      default:
        // Already sorted by latest via backend, but re-sorting is fine for safety if modified client-side
        return logs.sort(
          (a, b) =>
            new Date(b.dateFor).getTime() - new Date(a.dateFor).getTime(),
        );
    }
  }, [allThreeCellEntries, sortBy]);

  const handleEntryPress = (dateFor: string) => {
    router.replace(`/track/${dateFor}`);
  };

  const isSearching = searchText.length > 0;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 px-6">
        {/* Search Input */}
        <View className="mb-4">
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
            <MagnifyingGlassIcon size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Search your journal..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#9CA3AF"
              textAlignVertical="center"
              style={{
                fontSize: 14,
                margin: 0,
                paddingVertical: 0, // Explicitly remove vertical padding
                height: 40, // Ensure enough height for the text
                includeFontPadding: false, // Android specific fix
              }}
            />
            {searchText.length > 0 && (
              <Pressable onPress={() => setSearchText("")}>
                <View className="bg-gray-300 rounded-full p-1">
                  <XMarkIcon size={12} color="#FFFFFF" />
                </View>
              </Pressable>
            )}
          </View>
        </View>

        {/* Sort Buttons Row (Only show when not searching) */}
        {!isSearching && (
          <View className="flex-row justify-between items-center mb-4">
            <View className="relative h-8 rounded-md bg-gray-100 flex-row">
              {sortOptions.map((option) => (
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
        )}

        {/* Content Area */}
        {isSearching ? (
          // Search Results State
          <View className="flex-1">
            {!searchResults || searchText !== debouncedSearchText ? (
              <View className="items-center mt-12">
                <ActivityIndicator size="small" color="#6B7280" />
              </View>
            ) : searchResults.length === 0 ? (
              <View className="items-center opacity-50 mt-12">
                <Text className="text-gray-400 mt-4 text-center">
                  No entries found matching "{debouncedSearchText}"
                </Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                ListFooterComponent={<View className="h-8" />}
                renderItem={({ item }) => {
                  const baseColor =
                    SCORE_COLORS[item.score.toString()] ?? "#ffffff";
                  const bg = color(baseColor).fade(0.7).rgb().string();

                  return (
                    <MotiView
                      from={{ opacity: 0, translateY: 20 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ type: "timing", duration: 300 }}
                    >
                      <Pressable
                        onPress={() => handleEntryPress(item.dateFor)}
                        className="rounded-md p-4 mb-4 shadow-sm"
                        style={{ backgroundColor: bg }}
                      >
                        <View className="flex-row justify-between items-center">
                          <Text className="text-sm font-medium text-gray-900">
                            {format(new Date(item.dateFor), "MMM dd, yyyy")}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            ({item.score})
                          </Text>
                        </View>
                        <HighlightedText
                          text={item.summary}
                          highlight={debouncedSearchText}
                        />
                      </Pressable>
                    </MotiView>
                  );
                }}
              />
            )}
          </View>
        ) : (
          // Standard Log View with Pagination
          <View className="flex-1">
            <FlatList
              data={sortedLogs}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              onEndReached={() => {
                if (status === "CanLoadMore") {
                  loadMore(20);
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                <View className="h-20 items-center justify-center">
                  {status === "LoadingMore" && (
                    <ActivityIndicator size="small" color="#6B7280" />
                  )}
                  {status === "Exhausted" && sortedLogs.length > 0 && (
                    <Text className="text-xs text-gray-400">No more entries</Text>
                  )}
                </View>
              }
              renderItem={({ item }) => {
                const baseColor =
                  SCORE_COLORS[item.score.toString()] ?? "#ffffff";
                const bg = color(baseColor).fade(0.7).rgb().string();

                return (
                  <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 300 }}
                  >
                    <Pressable
                      onPress={() => handleEntryPress(item.dateFor)}
                      className="rounded-md p-4 mb-4 shadow-sm"
                      style={{ backgroundColor: bg }}
                    >
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm font-medium text-gray-900">
                          {format(new Date(item.dateFor), "MMM dd, yyyy")}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          ({item.score})
                        </Text>
                      </View>
                      <Text className="text-sm text-gray-700 mt-2 leading-5">
                        {item.summary}
                      </Text>
                    </Pressable>
                  </MotiView>
                );
              }}
            />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}
