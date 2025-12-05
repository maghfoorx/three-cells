import React, { useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import color from "color";
import { SCORE_COLORS } from "@/utils/types";
import { YearlyReviewCard } from "./YearlyReviewCard";

const MONTH_CARD_HEIGHT = 320;

export interface MonthData {
  monthName: string;
  days: Date[];
  id: string;
  monthIndex: number;
}

interface CalendarViewProps {
  allThreeCellEntries: any;
  months: MonthData[];
  onEndReached: () => void;
  overallViewOfYear: any;
}

export default function CalendarView({
  allThreeCellEntries,
  months,
  onEndReached,
  overallViewOfYear,
}: CalendarViewProps) {
  const scoreMap = useMemo(() => {
    const map = new Map<string, number>();
    if (allThreeCellEntries) {
      allThreeCellEntries.forEach((entry: any) => {
        map.set(entry.dateFor, entry.score);
      });
    }
    return map;
  }, [allThreeCellEntries]);

  const currentYear = new Date().getFullYear();

  const overallView = useMemo(() => {
    if (overallViewOfYear) {
      return overallViewOfYear;
    }

    return {
      [-2]: 0,
      [-1]: 0,
      [0]: 0,
      [1]: 0,
      [2]: 0,
    };
  }, [overallViewOfYear]);

  return (
    <FlatList
      data={months}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <YearlyReviewCard
          year={currentYear.toString()}
          scoreCounts={overallView}
        />
      }
      renderItem={({ item }) => (
        <MonthCard
          monthName={item.monthName}
          days={item.days}
          scoreMap={scoreMap}
        />
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      initialNumToRender={2}
      windowSize={3}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 16 }}
    />
  );
}

type MonthCardProps = {
  monthName: string;
  days: Date[];
  scoreMap: Map<string, number>;
};

const MonthCard = ({ monthName, days, scoreMap }: MonthCardProps) => {
  return (
    <View
      className="bg-white rounded-md shadow-sm mb-4 mx-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {/* Month Header */}
      <View className="px-4 py-4 border-b border-gray-100">
        <Text className="text-xs font-semibold text-gray-900 uppercase">
          {monthName}
        </Text>
      </View>

      {/* Calendar Grid */}
      <View className="p-4">
        <MonthGrid days={days} scoreMap={scoreMap} />
      </View>
    </View>
  );
};

function MonthGrid({
  days,
  scoreMap,
}: {
  days: Date[];
  scoreMap: Map<string, number>;
}) {
  const router = useRouter();
  const firstDay = days[0].getDay();

  const handleDateClicked = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    router.replace(`/track/${formattedDate}`);
  };

  const calendarCells: Array<
    { type: "empty"; key: string } | { type: "day"; day: Date; key: string }
  > = [];

  for (let i = 0; i < firstDay; i++) {
    calendarCells.push({ type: "empty", key: `empty-start-${i}` });
  }

  days.forEach((day) => {
    calendarCells.push({ type: "day", day, key: day.toISOString() });
  });

  const totalCells = calendarCells.length;
  const remainingCells = 7 - (totalCells % 7);
  if (remainingCells < 7) {
    for (let i = 0; i < remainingCells; i++) {
      calendarCells.push({ type: "empty", key: `empty-end-${i}` });
    }
  }

  const rows = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    rows.push(calendarCells.slice(i, i + 7));
  }

  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <View>
      {/* Weekday headers */}
      <View className="flex-row mb-3">
        {weekdayLabels.map((label, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-xs font-medium text-gray-500 uppercase">
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar rows */}
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} className="flex-row mb-1">
          {row.map((cell) => {
            if (cell.type === "empty") {
              return <View key={cell.key} className="flex-1 h-12" />;
            }

            const dateStr = format(cell.day, "yyyy-MM-dd");
            const score = scoreMap.get(dateStr);
            const bgColor =
              score !== undefined ? SCORE_COLORS[score] : undefined;
            const isToday = format(new Date(), "yyyy-MM-dd") === dateStr;
            const isFuture = cell.day > new Date();

            return (
              <TouchableOpacity
                key={cell.key}
                disabled={isFuture}
                onPress={() => handleDateClicked(cell.day)}
                className={`flex-1 h-12 justify-center items-center mx-0.5 rounded-md ${isToday && !bgColor ? "bg-blue-50 border border-blue-200" : ""
                  } ${isFuture ? "opacity-30" : ""}`}
                style={{
                  backgroundColor:
                    bgColor || (isToday ? "#EFF6FF" : "transparent"),
                }}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-sm font-medium ${isToday && !bgColor ? "text-blue-700" : ""
                    }`}
                  style={{
                    color: score !== undefined ? "white" : bgColor
                      ? color(bgColor).isLight()
                        ? "#374151"
                        : "white"
                      : isToday
                        ? "#1D4ED8"
                        : "#374151",
                  }}
                >
                  {cell.day.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}
