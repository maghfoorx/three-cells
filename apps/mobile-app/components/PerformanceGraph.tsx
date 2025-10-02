import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { DataModel } from "@packages/backend/convex/_generated/dataModel";
import Svg, { Path, Circle, G, Text as SvgText } from "react-native-svg";
import * as d3 from "d3";
import color from "color";
import * as Haptics from "expo-haptics";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface PerformanceGraphProps {
  habitId: DataModel["userHabits"]["document"]["_id"];
  habitColor: string;
}

const CONTAINER_PADDING = 16; // 16px on each side (px-4)
const TEXT_PADDING = 28; // Extra padding for percentage labels
const VERTICAL_PADDING = 20; // Top and bottom padding for text labels
const GRAPH_HEIGHT = 120;

export default function PerformanceGraph({
  habitId,
  habitColor,
}: PerformanceGraphProps) {
  const [viewMode, setViewMode] = useState<"weekly" | "monthly" | "yearly">(
    "weekly",
  );
  const [containerWidth, setContainerWidth] = useState(300); // Default fallback
  const [selectedDotIndex, setSelectedDotIndex] = useState<number | null>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const weeklyData = useQuery(api.habits.getWeeklyPerformance, { habitId });
  const monthlyData = useQuery(api.habits.getMonthlyPerformance, { habitId });
  const yearlyData = useQuery(api.habits.getYearlyPerformance, { habitId });

  const currentData =
    viewMode === "weekly"
      ? weeklyData
      : viewMode === "monthly"
        ? monthlyData
        : yearlyData;
  const isLoading = currentData === undefined;

  // Calculate graph width based on actual container width
  const graphWidth = containerWidth - CONTAINER_PADDING;

  // Handle container layout to get actual width
  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

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

  const handleDotLongPress = (index: number) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDotIndex(index);
  };

  const getSelectedDotInfo = () => {
    if (
      !currentData ||
      selectedDotIndex === null ||
      selectedDotIndex === 0 ||
      selectedDotIndex === currentData.length - 1
    ) {
      return null;
    }

    const entry = currentData[selectedDotIndex];
    return {
      value: `${entry.value}%`,
      label: entry.label,
    };
  };

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
          <Svg width={graphWidth} height={GRAPH_HEIGHT}>
            <Circle
              cx={graphWidth / 2}
              cy={GRAPH_HEIGHT / 2}
              r={6}
              fill={habitColor}
            />
            <G>
              <SvgText
                x={graphWidth / 2}
                y={GRAPH_HEIGHT / 2 - 20}
                fontSize="12"
                fill={color(habitColor).mix(color("black"), 0.4).hex()}
                textAnchor="middle"
                fontWeight="600"
              >
                {singlePoint.value}%
              </SvgText>
              <SvgText
                x={graphWidth / 2}
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
      .range([TEXT_PADDING, graphWidth - TEXT_PADDING]);

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
      <Svg width={graphWidth} height={GRAPH_HEIGHT}>
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
        {dataWithDates.map((d, i) => {
          const cx = xScale(d.date);
          const cy = yScale(d.value);
          const isFirstOrLast = i === 0 || i === dataWithDates.length - 1;

          return (
            <G key={i}>
              <Circle cx={cx} cy={cy} r={4} fill={habitColor} opacity={0.9} />
              {/* Invisible larger circle for easier touch target */}
              {!isFirstOrLast && (
                <Circle
                  cx={cx}
                  cy={cy}
                  r={15}
                  fill="transparent"
                  onPressIn={() => handleDotLongPress(i)}
                  onPressOut={() => setSelectedDotIndex(null)}
                />
              )}
            </G>
          );
        })}

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
    <View
      className="px-4 py-3 bg-gray-50 rounded-lg mx-4 mb-4"
      onLayout={handleLayout}
    >
      {/* Floating value tooltip at top */}
      {getSelectedDotInfo() && (
        <View
          className="absolute top-2 left-0 right-0 items-center z-10"
          style={{ pointerEvents: "none" }}
        >
          <View
            className="px-3 py-2 rounded-md shadow-lg"
            style={{
              backgroundColor: color(habitColor).mix(color("white"), 0.1).hex(),
            }}
          >
            <Text
              className="text-sm font-semibold text-center"
              style={{
                color: color(habitColor).mix(color("black"), 0.4).hex(),
              }}
            >
              {getSelectedDotInfo()!.value}
            </Text>
            <Text
              className="text-xs opacity-90 text-center"
              style={{
                color: color(habitColor).mix(color("black"), 0.4).hex(),
              }}
            >
              {getSelectedDotInfo()!.label}
            </Text>
          </View>
        </View>
      )}

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

          <Pressable
            onPress={() => setViewMode("yearly")}
            className={`px-3 py-1.5 rounded-md ${
              viewMode === "yearly" ? "bg-gray-100" : ""
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                viewMode === "yearly" ? "text-gray-800" : "text-gray-500"
              }`}
            >
              Yearly
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
          : viewMode === "monthly"
            ? "Completion rate over the last 6 months"
            : "Completion rate over the last 12 months"}
      </Text>
    </View>
  );
}
