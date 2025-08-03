import React, { useMemo, useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, Dimensions } from "react-native";
import { PlusIcon } from "react-native-heroicons/outline";
import Svg, { Path, Circle, G, Text as SvgText } from "react-native-svg";
import * as d3 from "d3";
import color from "color";
import { Link, router } from "expo-router";
import { format } from "date-fns";
import type { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { formatValueByIncrement } from "@/utils/numbers";

const AnimatedPath = Animated.createAnimatedComponent(Path);

type MetricSubmission = {
  dateFor: string;
  value: number;
  submittedAt: number;
};

type UserMetricCardProps = {
  metric: DataModel["userMetrics"]["document"];
  submissions?: MetricSubmission[];
};

const GRAPH_HEIGHT = 120;
const PADDING = 20;

const { width: screenWidth } = Dimensions.get("window");
const GRAPH_WIDTH = screenWidth * 0.8; // 85% of screen width

export function UserMetricCardMobile({
  metric,
  submissions = [],
}: UserMetricCardProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Get last 7 entries (not necessarily last 7 days)
  const last7Entries = useMemo(() => {
    if (!submissions || submissions.length === 0) return [];

    const sorted = [...submissions].sort(
      (a, b) => new Date(a.dateFor).getTime() - new Date(b.dateFor).getTime(),
    );

    return sorted.slice(-7).map((entry) => ({
      date: new Date(entry.dateFor),
      value: entry.value,
      dateFor: entry.dateFor,
    }));
  }, [submissions]);

  const last7EntriesAverage = useMemo(() => {
    if (last7Entries.length === 0) return 0;

    const sum = last7Entries.reduce((acc, entry) => acc + entry.value, 0);
    return formatValueByIncrement(sum / last7Entries.length, metric.increment);
  }, [last7Entries]);

  // Animation effect
  useEffect(() => {
    if (last7Entries.length > 0) {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [last7Entries, animatedValue]);

  const addMetricEntryPressed = () => {
    router.navigate(`/metrics/add-metric-entry?metricId=${metric._id}`);
  };

  const renderGraph = () => {
    if (last7Entries.length === 0) {
      return (
        <View className="items-center justify-center h-full">
          <Text className="text-gray-400 text-sm">No data yet</Text>
          <Text className="text-gray-300 text-xs mt-1">
            Add your first entry
          </Text>
        </View>
      );
    }

    if (last7Entries.length === 1) {
      // Single point visualization
      const singlePoint = last7Entries[0];
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
                {singlePoint.value}
              </SvgText>
              <SvgText
                x={GRAPH_WIDTH / 2}
                y={GRAPH_HEIGHT / 2 + 30}
                fontSize="10"
                fill="#9CA3AF"
                textAnchor="middle"
              >
                {format(singlePoint.date, "MMM d")}
              </SvgText>
            </G>
          </Svg>
        </View>
      );
    }

    // Multiple points - line graph
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(last7Entries, (d) => d.date) as [Date, Date])
      .range([PADDING, GRAPH_WIDTH - PADDING]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(last7Entries, (d) => d.value)! * 0.95,
        d3.max(last7Entries, (d) => d.value)! * 1.05,
      ])
      .range([GRAPH_HEIGHT - PADDING, PADDING]);

    const lineGenerator = d3
      .line<{ date: Date; value: number }>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const path = lineGenerator(last7Entries)!;

    return (
      <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
        <AnimatedPath
          d={path}
          fill="none"
          stroke={metric.colour}
          strokeWidth={2.5}
          strokeDasharray={animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ["0,1000", "1000,0"], // Adjust length as needed
          })}
        />

        {/* Data points */}
        {last7Entries.map((d, i) => (
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
        {last7Entries.length > 1 && (
          <G>
            <SvgText
              x={xScale(last7Entries[0].date)}
              y={yScale(last7Entries[0].value) - 12}
              fontSize="10"
              fill={color(metric.colour).mix(color("black"), 0.4).hex()}
              textAnchor="middle"
              fontWeight="600"
            >
              {formatValueByIncrement(last7Entries[0].value, metric.increment)}
            </SvgText>
            <SvgText
              x={xScale(last7Entries[last7Entries.length - 1].date)}
              y={yScale(last7Entries[last7Entries.length - 1].value) - 12}
              fontSize="10"
              fill={color(metric.colour).mix(color("black"), 0.4).hex()}
              textAnchor="middle"
              fontWeight="600"
            >
              {formatValueByIncrement(
                last7Entries[last7Entries.length - 1].value,
                metric.increment,
              )}
            </SvgText>
          </G>
        )}

        {/* Date labels for first and last points */}
        {last7Entries.length > 1 && (
          <G>
            <SvgText
              x={xScale(last7Entries[0].date)}
              y={GRAPH_HEIGHT - 4}
              fontSize="9"
              fill="#9CA3AF"
              textAnchor="middle"
            >
              {format(last7Entries[0].date, "MMM d")}
            </SvgText>
            <SvgText
              x={xScale(last7Entries[last7Entries.length - 1].date)}
              y={GRAPH_HEIGHT - 4}
              fontSize="9"
              fill="#9CA3AF"
              textAnchor="middle"
            >
              {format(last7Entries[last7Entries.length - 1].date, "MMM d")}
            </SvgText>
          </G>
        )}
      </Svg>
    );
  };

  return (
    <View
      className="rounded-xl p-5 border border-gray-200"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        backgroundColor: color(metric.colour).mix(color("white"), 0.95).hex(),
      }}
    >
      {/* Header */}
      <View className="flex flex-row justify-between items-center mb-4">
        <Link href={`/metrics/${metric._id}`} asChild>
          <Pressable className="flex flex-row items-center gap-3 flex-1">
            <View
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: metric.colour }}
            />
            <View className="flex-1 flex flex-row gap-1 items-center">
              <Text className="text-base font-semibold text-gray-900">
                {metric.name}
              </Text>
              {metric.unit && (
                <Text className="text-xs text-gray-500">({metric.unit})</Text>
              )}
            </View>
          </Pressable>
        </Link>

        <Pressable
          onPress={addMetricEntryPressed}
          className="w-8 h-8 rounded-md items-center justify-center"
          style={{
            backgroundColor: color(metric.colour)
              .mix(color("white"), 0.8)
              .hex(),
          }}
        >
          <PlusIcon
            size={16}
            color={color(metric.colour).mix(color("black"), 0.3).hex()}
          />
        </Pressable>
      </View>

      {/* Graph */}
      <View className="h-32 mb-3">{renderGraph()}</View>

      {/* Stats */}
      <View className="flex flex-row justify-between items-center pt-3 border-t border-gray-100">
        <Text className="text-sm text-gray-500">
          average: {last7EntriesAverage}
        </Text>
        {last7Entries.length > 1 && (
          <View className="flex flex-row items-center gap-2">
            <Text className="text-sm text-gray-500">latest:</Text>
            <Text className="text-sm font-medium text-gray-900">
              {formatValueByIncrement(
                last7Entries[last7Entries.length - 1].value,
                metric.increment,
              )}
              {metric.unit ? ` ${metric.unit}` : ""}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default UserMetricCardMobile;
