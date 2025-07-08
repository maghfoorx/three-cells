import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { useRouter } from "expo-router";
import color from "color";
import { SCORE_COLORS } from "@/utils/types";

const MONTH_CARD_HEIGHT = 300;

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

  // In your useEffect:
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (scrollRef.current) {
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
      className=""
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
      initialNumToRender={1}
      windowSize={3}
      showsVerticalScrollIndicator={false}
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
      className="border rounded-sm p-4 mt-2"
      onLayout={(event) => {
        const y = event.nativeEvent.layout.y;
        onLayout?.(y);
      }}
    >
      <Text className="text-lg font-semibold mb-3">{monthName}</Text>
      <MonthGrid days={days} scoreMap={scoreMap} />
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
    router.navigate(`/track/${formattedDate}`);
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

  return (
    <View>
      {/* Weekday headers */}
      <View className="flex flex-row mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <View key={i} className="flex-1 h-8 mx-0.5">
            <Text className="text-center text-gray-600 font-medium">{d}</Text>
          </View>
        ))}
      </View>

      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} className="flex flex-row mb-1">
          {row.map((cell) => {
            if (cell.type === "empty") {
              return (
                <View
                  key={cell.key}
                  className="flex-1 h-10 mx-0.5 rounded-sm"
                />
              );
            }

            const dateStr = format(cell.day, "yyyy-MM-dd");
            const score = scoreMap.get(dateStr);
            const bgColor =
              score !== undefined ? SCORE_COLORS[score] : undefined;

            return (
              <TouchableOpacity
                key={cell.key}
                onPress={() => handleDateClicked(cell.day)}
                className="flex-1 h-10 justify-center items-center mx-0.5 rounded-sm"
                style={{ backgroundColor: bgColor }}
              >
                <Text
                  style={{
                    color:
                      bgColor != null
                        ? color(bgColor).isLight()
                          ? "black"
                          : "white"
                        : "black",
                  }}
                  className="text-sm"
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
