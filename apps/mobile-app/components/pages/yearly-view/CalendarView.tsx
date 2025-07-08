import React, { memo, useEffect, useMemo, useRef } from "react";
import color from "color";
import { Feather } from "@expo/vector-icons";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useQuery } from "convex/react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { api } from "@packages/backend/convex/_generated/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { SCORE_COLORS } from "@/utils/types";

interface MonthCardProps {
  monthName: string;
  days: Date[];
  monthIndex: number;
  scoreMap: Map<string, number>;
}

const CalendarView = memo(
  ({ allThreeCellEntries }: { allThreeCellEntries: any }) => {
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

    const scrollRef = useRef<ScrollView>(null);
    const monthRefs = useRef<{ [key: number]: View | null }>({});

    const currentMonthIndex = new Date().getMonth();

    const months = useMemo(() => {
      return Array.from({ length: 12 }, (_, i) => {
        const start = startOfMonth(new Date(currentYear, i));
        const end = endOfMonth(start);
        const days = eachDayOfInterval({ start, end });
        return { monthName: format(start, "MMMM"), days, monthIndex: i };
      });
    }, [currentYear]);

    useEffect(() => {
      if (monthRefs.current[currentMonthIndex - 1]) {
        monthRefs.current[currentMonthIndex - 1]?.measureLayout(
          scrollRef.current as any,
          (x, y) => {
            scrollRef.current?.scrollTo({ y, animated: false });
          },
          () => {},
        );
      }
    }, []);
    return (
      <ScrollView
        className="mt-4"
        showsVerticalScrollIndicator={false}
        ref={scrollRef}
      >
        <View className="flex flex-col gap-4">
          {months.map((month, index) => (
            <MonthCard
              key={index}
              monthName={month.monthName}
              days={month.days}
              monthIndex={month.monthIndex}
              scoreMap={scoreMap}
              ref={(ref) => {
                monthRefs.current[index] = ref;
              }}
            />
          ))}
        </View>
      </ScrollView>
    );
  },
);

const MonthCard = React.forwardRef<View, MonthCardProps>(
  ({ monthName, days, monthIndex, scoreMap }, ref) => {
    return (
      <View className="border rounded-sm p-4" ref={ref}>
        <Text className="text-lg font-semibold mb-3">{monthName}</Text>
        <MonthGrid days={days} scoreMap={scoreMap} />
      </View>
    );
  },
);

interface MonthGridProps {
  days: Date[];
  scoreMap: Map<string, number>;
}

function MonthGrid({ days, scoreMap }: MonthGridProps) {
  const month = days[0].getMonth();
  const router = useRouter();
  const firstDay = days[0].getDay();

  const handleDateClicked = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    router.navigate(`/track/${formattedDate}`);
  };

  // Create array of all calendar cells (empty + actual days + trailing empty)
  const calendarCells: Array<
    | {
        type: "empty";
        key: string;
      }
    | {
        type: "day";
        day: Date;
        key: string;
      }
  > = [];

  // Add empty cells for alignment at start
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push({ type: "empty", key: `empty-start-${i}` });
  }

  // Add actual days
  days.forEach((day) => {
    calendarCells.push({ type: "day", day, key: day.toISOString() });
  });

  // Add empty cells at the end to complete the last row if needed
  const totalCells = calendarCells.length;
  const remainingCells = 7 - (totalCells % 7);
  if (remainingCells < 7) {
    for (let i = 0; i < remainingCells; i++) {
      calendarCells.push({ type: "empty", key: `empty-end-${i}` });
    }
  }

  // Group cells into rows of 7
  const rows = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    rows.push(calendarCells.slice(i, i + 7));
  }

  return (
    <View className="text-sm">
      {/* Weekday headers */}
      <View className="flex flex-row mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, index) => (
          <View
            key={`weekday-${index}-month-${month}`}
            className="flex-1 h-8 mx-0.5"
          >
            <Text className="font-medium text-center text-gray-600">{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar rows */}
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
                className="flex-1 h-10 justify-center items-center rounded-sm mx-0.5"
                style={{
                  backgroundColor: bgColor,
                }}
                onPress={() => handleDateClicked(cell.day)}
              >
                <Text
                  className="text-center text-sm"
                  style={{
                    color:
                      bgColor != null
                        ? color(bgColor).isLight()
                          ? "black"
                          : "white"
                        : "black",
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

export default CalendarView;
