import { router, useLocalSearchParams } from "expo-router";
import { XMarkIcon } from "react-native-heroicons/outline";
import { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import MetricTrendChart from "@/components/pages/metrics/MetricTrendChart";
import MetricStatisticsCards from "@/components/pages/metrics/MetricStatisticsCards";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SingleMetricPage() {
  const { singleMetric: singleMetricId } = useLocalSearchParams();

  const metricId =
    singleMetricId as DataModel["userMetrics"]["document"]["_id"];

  const singleMetric = useQuery(
    api.userMetrics.queries.getAllSubmissionsForMetric,
    {
      metricId: metricId,
    },
  );

  const [containerWidth, setContainerWidth] = useState(300); // Default fallback
  const GRAPH_WIDTH = containerWidth * 0.9;

  // Handle container layout to get actual width
  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  if (singleMetric === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="py-4 flex-grow">
          <View className="px-4 pt-2 flex flex-row items-center justify-between">
            <Pressable onPress={() => {}} disabled>
              <Feather name="settings" size={20} color="#374151" />
            </Pressable>

            <Text className="text-lg font-bold text-gray-800">Metric</Text>
            <Pressable onPress={() => router.back()}>
              <XMarkIcon size={24} color="#374151" />
            </Pressable>
          </View>
          <View className="mt-4 items-center justify-center">
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (singleMetric === null || !singleMetric.metric) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="p-4 flex-grow">
          <View className="px-4 pt-2 flex flex-row items-center justify-between">
            <Pressable onPress={() => {}} disabled>
              <Feather name="settings" size={20} color="#374151" />
            </Pressable>

            <Text className="text-lg font-bold text-gray-800">Metric</Text>
            <Pressable onPress={() => router.back()}>
              <XMarkIcon size={24} color="#374151" />
            </Pressable>
          </View>
          <View className="mt-4 items-center justify-center">
            <Text className="text-gray-400 text-sm">
              Could not find this metric 😢
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" onLayout={handleLayout}>
      <View className="py-4 flex-grow">
        <View className="px-4 py-2 flex flex-row items-center justify-between">
          <Pressable
            onPress={() => router.navigate(`/metrics/edit/${singleMetricId}`)}
          >
            <Feather name="settings" size={20} color="#374151" />
          </Pressable>

          <Text className="text-lg font-bold text-gray-800">
            {singleMetric.metric.name}
          </Text>
          <Pressable onPress={() => router.back()}>
            <XMarkIcon size={24} color="#374151" />
          </Pressable>
        </View>
        <ScrollView>
          <View className="mt-6 flex gap-2">
            {/* Trend Chart */}
            <MetricTrendChart
              metricId={metricId}
              metric={singleMetric.metric}
              graphWidth={GRAPH_WIDTH}
            />

            {/* Statistics Cards */}
            <MetricStatisticsCards
              metricId={metricId}
              metric={singleMetric.metric}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
