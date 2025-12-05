import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import Svg, { Rect, Text as SvgText, G } from "react-native-svg";
import { View, Text, Image, Animated, ActivityIndicator } from "react-native";
import { SCORE_COLORS, MOOD_IMAGES } from "@/utils/types";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

interface YearlyReviewCardProps {
  year: string;
  scoreCounts: Record<number, number>;
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CONTAINER_PADDING = 16;
const BAR_PADDING = 8;
const BAR_HEIGHT = 24;
const CHART_HEIGHT = 180; // Enough for 5 bars + spacing

export function YearlyReviewCard({ year, scoreCounts }: YearlyReviewCardProps) {
  const [containerWidth, setContainerWidth] = useState(300); // Default fallback

  const animatedValue = useRef(new Animated.Value(0)).current;
  const scoresForYear = useQuery(api.threeCells.overallViewOfYear, { year });

  const isLoading = scoresForYear === undefined;

  const chartWidth = containerWidth - CONTAINER_PADDING;

  // Handle container layout to get actual width
  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  // Animation effect - trigger when data loads
  useEffect(() => {
    if (scoresForYear != null) {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [animatedValue, scoresForYear]);

  const scores = [-2, -1, 0, 1, 2];
  const maxCount = Math.max(...Object.values(scoreCounts), 1);

  const renderStreaksChart = () => {
    if (isLoading) {
      return (
        <View className="items-center justify-center h-full">
          <ActivityIndicator size="small" />
        </View>
      );
    }

    const topStreaks = Object.values(scoresForYear);
    const maxStreak = Math.max(...topStreaks.map((s) => s));

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
          const barWidth = widthScale(streak);
          const isCurrentStreak = streak;

          // Use different opacity/color for current streak
          const barColor = "#F54927";

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
                {streak} day{streak !== 1 ? "s" : ""}
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
                {isCurrentStreak && " (current)"}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    );
  };

  return (
    <View className="px-4 py-4 mx-4 mb-4 bg-white" onLayout={handleLayout}>
      {/* Top 5 Streaks Chart */}
      <View className="mb-2">
        <Text className="uppercase text-xs font-bold mb-3">
          {year} overview
        </Text>
        <View style={{ height: CHART_HEIGHT }}>{renderStreaksChart()}</View>
      </View>
    </View>
  );
}
