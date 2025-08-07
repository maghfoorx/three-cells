import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Animated,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { DataModel } from "@packages/backend/convex/_generated/dataModel";
import Svg, { Path, Circle, G, Text as SvgText } from "react-native-svg";
import * as d3 from "d3";
import color from "color";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface PerformanceGraphProps {
  habitId: DataModel["userHabits"]["document"]["_id"];
  habitColor: string;
}

const { width: screenWidth } = Dimensions.get("window");
const CONTAINER_PADDING = 32; // 16px on each side (px-4)
const TEXT_PADDING = 30; // Extra padding for percentage labels
const VERTICAL_PADDING = 20; // Top and bottom padding for text labels
const GRAPH_WIDTH = screenWidth - CONTAINER_PADDING;
const GRAPH_HEIGHT = 120;

export default function PerformanceGraph({
  habitId,
  habitColor,
}: PerformanceGraphProps) {
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const animatedValue = useRef(new Animated.Value(0)).current;

  const weeklyData = useQuery(api.habits.getWeeklyPerformance, { habitId });
  const monthlyData = useQuery(api.habits.getMonthlyPerformance, { habitId });

  const currentData = viewMode === "weekly" ? weeklyData : monthlyData;
  const isLoading = currentData === undefined;

  // Animation effect - trigger when data changes or view mode changes
  useEffect(() => {
    if (currentData && currentData.length > 1) {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [currentData, viewMode, animatedValue]);

  const renderGraph = () => {
    if (isLoading) {
      return (
        <View className="items-center justify-center h-full">
          <ActivityIndicator size="small" color={habitColor} />
        </View>
      );
    }

    if (!currentData || currentData.length === 0) {
      return (
        <View className="items-center justify-center h-full">
          <Text className="text-gray-400 text-sm">No data yet</Text>
          <Text className="text-gray-300 text-xs mt-1">
            Start tracking to see your progress
          </Text>
        </View>
      );
    }

    if (currentData.length === 1) {
      // Single point visualization
      const singlePoint = currentData[0];
      return (
        <View className="items-center justify-center h-full">
          <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
            <Circle
              cx={GRAPH_WIDTH / 2}
              cy={GRAPH_HEIGHT / 2}
              r={6}
              fill={habitColor}
            />
            <G>
              <SvgText
                x={GRAPH_WIDTH / 2}
                y={GRAPH_HEIGHT / 2 - 20}
                fontSize="12"
                fill={color(habitColor).mix(color("black"), 0.4).hex()}
                textAnchor="middle"
                fontWeight="600"
              >
                {singlePoint.value}%
              </SvgText>
              <SvgText
                x={GRAPH_WIDTH / 2}
                y={GRAPH_HEIGHT / 2 + 30}
                fontSize="10"
                fill="#9CA3AF"
                textAnchor="middle"
              >
                {singlePoint.label}
              </SvgText>
            </G>
          </Svg>
        </View>
      );
    }

    // Multiple points - line graph
    // Convert timestamps back to Date objects for D3
    const dataWithDates = currentData.map((d) => ({
      ...d,
      date: new Date(d.date),
    }));

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dataWithDates, (d) => d.date) as [Date, Date])
      .range([TEXT_PADDING, GRAPH_WIDTH - TEXT_PADDING]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 100]) // Always 0-100% for performance data
      .range([GRAPH_HEIGHT - VERTICAL_PADDING, VERTICAL_PADDING]);

    const lineGenerator = d3
      .line<{ date: Date; value: number }>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const path = lineGenerator(dataWithDates)!;

    return (
      <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
        <AnimatedPath
          d={path}
          fill="none"
          stroke={habitColor}
          strokeWidth={2.5}
          strokeOpacity={0.8}
          strokeDasharray={animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ["0,1000", "1000,0"], // Adjust length as needed
          })}
        />

        {/* Data points */}
        {dataWithDates.map((d, i) => (
          <Circle
            key={i}
            cx={xScale(d.date)}
            cy={yScale(d.value)}
            r={4}
            fill={habitColor}
            opacity={0.9}
          />
        ))}

        {/* Show first and last values */}
        <G>
          <SvgText
            x={xScale(dataWithDates[0].date)}
            y={yScale(dataWithDates[0].value) - 12}
            fontSize="10"
            fill={color(habitColor).mix(color("black"), 0.4).hex()}
            textAnchor="middle"
            fontWeight="600"
          >
            {dataWithDates[0].value}%
          </SvgText>
          <SvgText
            x={xScale(dataWithDates[dataWithDates.length - 1].date)}
            y={yScale(dataWithDates[dataWithDates.length - 1].value) - 12}
            fontSize="10"
            fill={color(habitColor).mix(color("black"), 0.4).hex()}
            textAnchor="middle"
            fontWeight="600"
          >
            {dataWithDates[dataWithDates.length - 1].value}%
          </SvgText>
        </G>

        {/* Date labels for first and last points */}
        <G>
          <SvgText
            x={xScale(dataWithDates[0].date)}
            y={GRAPH_HEIGHT - 4}
            fontSize="9"
            fill="#9CA3AF"
            textAnchor="middle"
          >
            {dataWithDates[0].label}
          </SvgText>
          <SvgText
            x={xScale(dataWithDates[dataWithDates.length - 1].date)}
            y={GRAPH_HEIGHT - 4}
            fontSize="9"
            fill="#9CA3AF"
            textAnchor="middle"
          >
            {dataWithDates[dataWithDates.length - 1].label}
          </SvgText>
        </G>
      </Svg>
    );
  };

  return (
    <View className="px-4 py-3 bg-gray-50 rounded-lg mx-4 mb-4">
      {/* Header with toggle buttons */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-semibold text-gray-800">
          Performance
        </Text>
        <View className="flex-row bg-white rounded-lg p-1 shadow-sm">
          <Pressable
            onPress={() => setViewMode("weekly")}
            className={`px-3 py-1.5 rounded-md ${
              viewMode === "weekly" ? "bg-gray-100" : ""
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                viewMode === "weekly" ? "text-gray-800" : "text-gray-500"
              }`}
            >
              Weekly
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode("monthly")}
            className={`px-3 py-1.5 rounded-md ${
              viewMode === "monthly" ? "bg-gray-100" : ""
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                viewMode === "monthly" ? "text-gray-800" : "text-gray-500"
              }`}
            >
              Monthly
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Graph Container - centers the SVG */}
      <View className="items-center mb-2">
        <View className="h-32">{renderGraph()}</View>
      </View>

      {/* Description */}
      <Text className="text-xs text-gray-500 text-center">
        {viewMode === "weekly"
          ? "Completion rate over the last 8 weeks"
          : "Completion rate over the last 6 months"}
      </Text>
    </View>
  );
}
