import React from "react";
import { View, Text, SafeAreaView, ScrollView, Pressable } from "react-native";
import { PlusIcon } from "react-native-heroicons/outline";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { router } from "expo-router";
import UserMetricCardMobile from "@/components/pages/metrics/UserMetricCardMobile";
import LoadingScreen from "@/components/LoadingScreen";

export default function MetricsPage() {
  const allSubmissions = useQuery(
    api.userMetrics.queries.getAllUserMetricSubmissions,
    {
      includeArchived: false,
    },
  );

  const renderContent = () => {
    if (!allSubmissions) {
      // Loading state
      return <LoadingScreen pictureName="habits-loading.png" />;
    }

    if (allSubmissions.length === 0) {
      // Empty state
      return (
        <View className="flex-1 items-center justify-center py-20">
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
              <PlusIcon size={24} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-2">
              No metrics yet
            </Text>
            <Text className="text-gray-500 text-center mb-6 max-w-sm">
              Create your first metric to start tracking your progress
            </Text>
            <Pressable
              onPress={() => router.navigate("/create-new-metric")}
              className="bg-blue-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Create Metric</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    // Render metrics
    return (
      <View className="gap-4">
        {allSubmissions.map(({ metric, submissions }) => (
          <UserMetricCardMobile
            key={metric._id}
            metric={metric}
            submissions={submissions}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex flex-row justify-between items-center bg-white">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Metrics</Text>
            <Text className="text-base text-gray-500 mt-1">
              {allSubmissions?.length || 0} active metrics
            </Text>
          </View>
          <Pressable
            onPress={() => router.navigate("/create-new-metric")}
            className="w-12 h-12 rounded-md bg-white/80 items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <PlusIcon size={20} color="#6B7280" />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 32,
          }}
        >
          {renderContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
