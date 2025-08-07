import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { Feather } from "@expo/vector-icons";
import color from "color";
import { formatValueByIncrement } from "@/utils/numbers";

interface MetricStatisticsCardsProps {
  metricId: DataModel["userMetrics"]["document"]["_id"];
  metric: DataModel["userMetrics"]["document"];
}

export default function MetricStatisticsCards({
  metricId,
  metric,
}: MetricStatisticsCardsProps) {
  const statistics = useQuery(api.userMetrics.queries.getMetricStatistics, {
    metricId,
  });

  const isLoading = statistics === undefined;

  if (isLoading) {
    return (
      <View className="px-4 mb-4">
        <View className="bg-gray-50 rounded-lg p-4">
          <View className="items-center justify-center">
            <ActivityIndicator size="small" color={metric.colour} />
          </View>
        </View>
      </View>
    );
  }

  if (!statistics || statistics.totalEntries === 0) {
    return (
      <View className="px-4 mb-4">
        <View className="bg-gray-50 rounded-lg p-4">
          <View className="items-center justify-center">
            <Text className="text-gray-400 text-sm">No data yet</Text>
            <Text className="text-gray-300 text-xs mt-1">
              Add your first entry to see statistics
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const formatValue = (value: number | null) => {
    if (value === null) return "—";
    const formatted = formatValueByIncrement(value, metric.increment);
    return metric.unit ? `${formatted} ${metric.unit}` : formatted;
  };

  const getTrendIcon = () => {
    switch (statistics.trend) {
      case "up":
        return "trending-up";
      case "down":
        return "trending-down";
      default:
        return "minus";
    }
  };

  const getTrendColor = () => {
    switch (statistics.trend) {
      case "up":
        return "#10B981"; // green
      case "down":
        return "#EF4444"; // red
      default:
        return "#6B7280"; // gray
    }
  };

  return (
    <View className="px-4 mb-4">
      <Text className="text-base font-semibold text-gray-800 mb-3 px-0">
        Statistics
      </Text>

      {/* Current Value Card */}
      <View className="bg-white rounded-lg p-4 shadow-sm mb-3 border border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs text-gray-500 mb-1">Current Value</Text>
            <Text
              className="text-2xl font-bold"
              style={{
                color: color(metric.colour).mix(color("black"), 0.2).hex(),
              }}
            >
              {formatValue(statistics.currentValue)}
            </Text>
            {statistics.percentageChange !== null && (
              <View className="flex-row items-center mt-1">
                <Feather
                  name={getTrendIcon()}
                  size={12}
                  color={getTrendColor()}
                />
                <Text
                  className="text-xs font-medium ml-1"
                  style={{ color: getTrendColor() }}
                >
                  {Math.abs(statistics.percentageChange).toFixed(1)}%
                </Text>
                <Text className="text-xs text-gray-400 ml-1">vs previous</Text>
              </View>
            )}
          </View>

          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{
              backgroundColor: color(metric.colour)
                .mix(color("white"), 0.9)
                .hex(),
            }}
          >
            <View
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: metric.colour }}
            />
          </View>
        </View>
      </View>

      {/* Statistics Grid */}
      <View className="flex-row gap-3 mb-3">
        {/* 7-Day Average */}
        <View className="flex-1 bg-gray-50 rounded-lg p-3">
          <Text className="text-xs text-gray-500 mb-1">7-day avg</Text>
          <Text className="text-lg font-semibold text-gray-800">
            {formatValue(statistics.averageLast7Days)}
          </Text>
        </View>

        {/* 30-Day Average */}
        <View className="flex-1 bg-gray-50 rounded-lg p-3">
          <Text className="text-xs text-gray-500 mb-1">30-day avg</Text>
          <Text className="text-lg font-semibold text-gray-800">
            {formatValue(statistics.averageLast30Days)}
          </Text>
        </View>
      </View>

      {/* Min/Max and Total Entries */}
      <View className="flex-row gap-3">
        {/* Highest Value */}
        <View className="flex-1 bg-gray-50 rounded-lg p-3">
          <Text className="text-xs text-gray-500 mb-1">Highest</Text>
          <Text className="text-lg font-semibold text-gray-800">
            {formatValue(statistics.highestValue)}
          </Text>
        </View>

        {/* Lowest Value */}
        <View className="flex-1 bg-gray-50 rounded-lg p-3">
          <Text className="text-xs text-gray-500 mb-1">Lowest</Text>
          <Text className="text-lg font-semibold text-gray-800">
            {formatValue(statistics.lowestValue)}
          </Text>
        </View>

        {/* Total Entries */}
        <View className="flex-1 bg-gray-50 rounded-lg p-3">
          <Text className="text-xs text-gray-500 mb-1">Entries</Text>
          <Text className="text-lg font-semibold text-gray-800">
            {statistics.totalEntries}
          </Text>
        </View>
      </View>
    </View>
  );
}
