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
import { formatValueByIncrement } from "@/utils/numbers";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface MetricTrendChartProps {
  metricId: DataModel["userMetrics"]["document"]["_id"];
  metric: DataModel["userMetrics"]["document"];
}

const { width: screenWidth } = Dimensions.get("window");
const CONTAINER_PADDING = 32; // 16px on each side (px-4)
const TEXT_PADDING = 30; // Extra padding for value labels
const VERTICAL_PADDING = 20; // Top and bottom padding for text labels
const GRAPH_WIDTH = screenWidth - CONTAINER_PADDING;
const GRAPH_HEIGHT = 120;

export default function MetricTrendChart({
  metricId,
  metric,
}: MetricTrendChartProps) {
  const [viewMode, setViewMode] = useState<"7days" | "30days" | "90days">(
    "30days",
  );
  const animatedValue = useRef(new Animated.Value(0)).current;

  const trendData = useQuery(api.userMetrics.queries.getMetricTrendData, {
    metricId,
    period: viewMode,
  });

  const isLoading = trendData === undefined;

  // Animation effect - trigger when data changes or view mode changes
  useEffect(() => {
    if (trendData && trendData.length > 1) {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [trendData, viewMode, animatedValue]);

  const renderGraph = () => {
    if (isLoading) {
      return (
        <View className="items-center justify-center h-full">
          <ActivityIndicator size="small" color={metric.colour} />
        </View>
      );
    }

    if (!trendData || trendData.length === 0) {
      return (
        <View className="items-center justify-center h-full">
          <Text className="text-gray-400 text-sm">No data yet</Text>
          <Text className="text-gray-300 text-xs mt-1">
            Add entries to see your trend
          </Text>
        </View>
      );
    }

    if (trendData.length === 1) {
      // Single point visualization
      const singlePoint = trendData[0];
      return (
        <View className="items-center justify-center h-full">
          <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
            <Circle
              cx={GRAPH_WIDTH / 2}
              cy={GRAPH_HEIGHT / 2}
              r={6}
              fill={metric.colour}
            />
            <G>
              <SvgText
                x={GRAPH_WIDTH / 2}
                y={GRAPH_HEIGHT / 2 - 20}
                fontSize="12"
                fill={color(metric.colour).mix(color("black"), 0.4).hex()}
                textAnchor="middle"
                fontWeight="600"
              >
                {formatValueByIncrement(singlePoint.value, metric.increment)}
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
    const dataWithDates = trendData.map((d) => ({
      ...d,
      date: new Date(d.date),
    }));

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dataWithDates, (d) => d.date) as [Date, Date])
      .range([TEXT_PADDING, GRAPH_WIDTH - TEXT_PADDING]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(dataWithDates, (d) => d.value)! * 0.95,
        d3.max(dataWithDates, (d) => d.value)! * 1.05,
      ])
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
          stroke={metric.colour}
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
            fill={metric.colour}
            opacity={0.9}
          />
        ))}

        {/* Show first and last values */}
        <G>
          <SvgText
            x={xScale(dataWithDates[0].date)}
            y={yScale(dataWithDates[0].value) - 12}
            fontSize="10"
            fill={color(metric.colour).mix(color("black"), 0.4).hex()}
            textAnchor="middle"
            fontWeight="600"
          >
            {formatValueByIncrement(dataWithDates[0].value, metric.increment)}
          </SvgText>
          <SvgText
            x={xScale(dataWithDates[dataWithDates.length - 1].date)}
            y={yScale(dataWithDates[dataWithDates.length - 1].value) - 12}
            fontSize="10"
            fill={color(metric.colour).mix(color("black"), 0.4).hex()}
            textAnchor="middle"
            fontWeight="600"
          >
            {formatValueByIncrement(
              dataWithDates[dataWithDates.length - 1].value,
              metric.increment,
            )}
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
            {trendData[0].label}
          </SvgText>
          <SvgText
            x={xScale(dataWithDates[dataWithDates.length - 1].date)}
            y={GRAPH_HEIGHT - 4}
            fontSize="9"
            fill="#9CA3AF"
            textAnchor="middle"
          >
            {trendData[trendData.length - 1].label}
          </SvgText>
        </G>
      </Svg>
    );
  };

  return (
    <View className="px-4 py-3 bg-gray-50 rounded-lg mx-4 mb-4">
      {/* Header with toggle buttons */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-semibold text-gray-800">Trend</Text>
        <View className="flex-row bg-white rounded-lg p-1 shadow-sm">
          <Pressable
            onPress={() => setViewMode("7days")}
            className={`px-3 py-1.5 rounded-md ${
              viewMode === "7days" ? "bg-gray-100" : ""
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                viewMode === "7days" ? "text-gray-800" : "text-gray-500"
              }`}
            >
              7D
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode("30days")}
            className={`px-3 py-1.5 rounded-md ${
              viewMode === "30days" ? "bg-gray-100" : ""
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                viewMode === "30days" ? "text-gray-800" : "text-gray-500"
              }`}
            >
              30D
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode("90days")}
            className={`px-3 py-1.5 rounded-md ${
              viewMode === "90days" ? "bg-gray-100" : ""
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                viewMode === "90days" ? "text-gray-800" : "text-gray-500"
              }`}
            >
              90D
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
        {viewMode === "7days"
          ? "Values over the last 7 days"
          : viewMode === "30days"
            ? "Values over the last 30 days"
            : "Values over the last 90 days"}
      </Text>
    </View>
  );
}
