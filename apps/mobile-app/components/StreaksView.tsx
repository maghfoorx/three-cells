import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  Animated,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { DataModel } from "@packages/backend/convex/_generated/dataModel";
import Svg, { Rect, Text as SvgText, G } from "react-native-svg";
import * as d3 from "d3";
import color from "color";
import { format } from "date-fns";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface StreaksComponentProps {
  habitId: DataModel["userHabits"]["document"]["_id"];
  habitColor: string;
}

const { width: screenWidth } = Dimensions.get("window");
const CONTAINER_PADDING = 32;
const BAR_PADDING = 8;
const BAR_HEIGHT = 24;
const CHART_WIDTH = screenWidth - CONTAINER_PADDING;
const CHART_HEIGHT = 180; // Enough for 5 bars + spacing

export default function StreaksView({
  habitId,
  habitColor,
}: StreaksComponentProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const streaksData = useQuery(api.habits.getStreaksData, { habitId });

  const isLoading = streaksData === undefined;

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
    const barMaxWidth = CHART_WIDTH - 100;
    const widthScale = d3
      .scaleLinear()
      .domain([0, maxStreak])
      .range([0, barMaxWidth]);

    return (
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
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
                {format(new Date(streak.startDate), "MMM d")} -{" "}
                {format(new Date(streak.endDate), "MMM d")}
                {isCurrentStreak && " (current)"}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  };

  return (
    <View className="px-4 py-4 bg-gray-50 rounded-lg mx-4 mb-4">
      {/* Header with current streak */}
      <View className="mb-6">
        <Text className="text-base font-semibold text-gray-800 mb-2">
          Streaks
        </Text>

        {/* Current Streak Display */}
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-gray-500 mb-1">Current Streak</Text>
              <Text
                className="text-2xl font-bold"
                style={{ color: habitColor }}
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
