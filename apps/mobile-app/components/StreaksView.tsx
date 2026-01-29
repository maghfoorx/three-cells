import React, { useRef, useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Animated } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { DataModel } from "@packages/backend/convex/_generated/dataModel";
import Svg, { Rect, Text as SvgText, G } from "react-native-svg";
import * as d3 from "d3";
import color from "color";
import { format, parse } from "date-fns";

const AnimatedRect = Animated.createAnimatedComponent(Rect as any);

interface StreaksComponentProps {
  habitId: DataModel["userHabits"]["document"]["_id"];
  habitColor: string;
}

const CONTAINER_PADDING = 16;
const BAR_PADDING = 8;
const BAR_HEIGHT = 24;
const CHART_HEIGHT = 180; // Enough for 5 bars + spacing

export default function StreaksView({
  habitId,
  habitColor,
}: StreaksComponentProps) {
  const [containerWidth, setContainerWidth] = useState(300); // Default fallback
  const animatedValue = useRef(new Animated.Value(0)).current;
  const streaksData = useQuery(api.habits.getStreaksData, { habitId });

  const isLoading = streaksData === undefined;

  // Calculate chart width based on actual container width
  const chartWidth = containerWidth - CONTAINER_PADDING;

  // Handle container layout to get actual width
  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  // Animation effect - trigger when data loads
  useEffect(() => {
    if (streaksData && streaksData.topStreaks.length > 0) {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [streaksData, animatedValue]);

  const renderStreaksChart = () => {
    if (isLoading) {
      return (
        <View className="items-center justify-center h-full">
          <ActivityIndicator size="small" color={habitColor} />
        </View>
      );
    }

    if (!streaksData || streaksData.topStreaks.length === 0) {
      return (
        <View className="items-center justify-center h-full">
          <Text className="text-gray-400 text-sm">No streaks yet</Text>
          <Text className="text-gray-300 text-xs mt-1">
            Start building your first streak!
          </Text>
        </View>
      );
    }

    const { topStreaks } = streaksData;
    const maxStreak = Math.max(...topStreaks.map((s) => s.length));

    // Scale for bar widths (leave some padding on the right for labels)
    const barMaxWidth = chartWidth - 100;
    const widthScale = d3
      .scaleLinear()
      .domain([0, maxStreak])
      .range([0, barMaxWidth]);

    return (
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        {topStreaks.map((streak, index) => {
          const y = index * (BAR_HEIGHT + BAR_PADDING) + 0;
          const barWidth = widthScale(streak.length);
          const isCurrentStreak = streak.isCurrentStreak;

          // Use different opacity/color for current streak
          const barColor = isCurrentStreak
            ? habitColor
            : color(habitColor).alpha(0.6).string();

          return (
            <G key={index}>
              {/* Animated Bar */}
              <AnimatedRect
                x={0}
                y={y}
                width={animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, barWidth],
                })}
                height={BAR_HEIGHT}
                fill={barColor}
                rx={4}
                ry={4}
              />

              {/* Streak length label */}
              <SvgText
                x={barWidth + 10}
                y={y + BAR_HEIGHT / 2 + 1}
                fontSize="14"
                fontWeight="600"
                fill="#374151"
                textAnchor="start"
                alignmentBaseline="middle"
              >
                {streak.length} day{streak.length !== 1 ? "s" : ""}
              </SvgText>

              {/* Date range label */}
              <SvgText
                x={barWidth + 10}
                y={y + BAR_HEIGHT / 2 + 16}
                fontSize="10"
                fill="#9CA3AF"
                textAnchor="start"
                alignmentBaseline="middle"
              >
                {format(
                  parse(
                    new Date(streak.startDate).toISOString().split("T")[0],
                    "yyyy-MM-dd",
                    new Date(),
                  ),
                  "MMM d",
                )}{" "}
                -{" "}
                {format(
                  parse(
                    new Date(streak.endDate).toISOString().split("T")[0],
                    "yyyy-MM-dd",
                    new Date(),
                  ),
                  "MMM d",
                )}
                {isCurrentStreak && " (current)"}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  };

  return (
    <View
      className="px-4 py-4 bg-gray-50 rounded-lg mx-4 mb-4"
      onLayout={handleLayout}
    >
      {/* Header with current streak */}
      <View className="mb-6">
        <Text className="text-base font-semibold text-gray-800 mb-2">
          Streaks
        </Text>

        {/* Current Streak Display */}
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-gray-500 mb-1">Current streak</Text>
              <Text
                className="text-2xl font-bold"
                style={{
                  color: color(habitColor).mix(color("black"), 0.2).hex(),
                }}
              >
                {isLoading ? "..." : streaksData?.currentStreak || 0}
              </Text>
              <Text className="text-xs text-gray-400">
                day{!isLoading && streaksData?.currentStreak !== 1 ? "s" : ""}
              </Text>
            </View>

            {!isLoading && streaksData?.isCurrentStreakActive && (
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-green-700 text-xs font-medium">
                  Active
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Top 5 Streaks Chart */}
      <View className="mb-2">
        <Text className="text-sm font-medium text-gray-700 mb-3">
          Top streaks
        </Text>
        <View style={{ height: CHART_HEIGHT }}>{renderStreaksChart()}</View>
      </View>
    </View>
  );
}
