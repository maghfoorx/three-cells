import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { useRouter } from "expo-router";
import color from "color";
import { SCORE_COLORS } from "@/utils/types";

const MONTH_CARD_HEIGHT = 320;

export default function CalendarView({
  allThreeCellEntries,
}: {
  allThreeCellEntries: any;
}) {
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
  const scrollRef = useRef<FlatList>(null);
  const monthPositions = useRef<{ [key: number]: number }>({});
  const currentMonthIndex = new Date().getMonth();

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const start = startOfMonth(new Date(currentYear, i));
      const end = endOfMonth(start);
      const days = eachDayOfInterval({ start, end });
      return {
        key: i.toString(),
        monthName: format(start, "MMMM"),
        days,
        monthIndex: i,
      };
    });
  }, [currentYear]);

  const getItemLayout = (data: any, index: number) => ({
    length: MONTH_CARD_HEIGHT,
    offset: MONTH_CARD_HEIGHT * index,
    index,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (scrollRef.current && currentMonthIndex > 0) {
        scrollRef.current.scrollToIndex({
          index: currentMonthIndex - 1,
          animated: true,
        });
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [currentMonthIndex]);

  return (
    <FlatList
      ref={scrollRef}
      getItemLayout={getItemLayout}
      data={months}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => (
        <MonthCard
          monthName={item.monthName}
          days={item.days}
          monthIndex={item.monthIndex}
          scoreMap={scoreMap}
          onLayout={(y) => {
            monthPositions.current[item.monthIndex] = y;
          }}
        />
      )}
      initialNumToRender={2}
      windowSize={3}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

type MonthCardProps = {
  monthName: string;
  days: Date[];
  scoreMap: Map<string, number>;
  monthIndex: number;
  onLayout?: (y: number) => void;
};

const MonthCard = ({ monthName, days, scoreMap, onLayout }: MonthCardProps) => {
  return (
    <View
      className="bg-white rounded-md shadow-sm mb-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
      onLayout={(event) => {
        const y = event.nativeEvent.layout.y;
        onLayout?.(y);
      }}
    >
      {/* Month Header */}
      <View className="px-4 py-4 border-b border-gray-100">
        <Text className="text-lg font-semibold text-gray-900">{monthName}</Text>
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

            return (
              <TouchableOpacity
                key={cell.key}
                onPress={() => handleDateClicked(cell.day)}
                className={`flex-1 h-12 justify-center items-center mx-0.5 rounded-md ${
                  isToday && !bgColor ? "bg-blue-50 border border-blue-200" : ""
                }`}
                style={{
                  backgroundColor:
                    bgColor || (isToday ? "#EFF6FF" : "transparent"),
                }}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-sm font-medium ${
                    isToday && !bgColor ? "text-blue-700" : ""
                  }`}
                  style={{
                    color: bgColor
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
