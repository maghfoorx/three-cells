import { router, useLocalSearchParams } from "expo-router";
import { XMarkIcon, ShareIcon } from "react-native-heroicons/outline";
import { DataModel } from "@packages/backend/convex/_generated/dataModel";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  Modal,
  Share,
} from "react-native";
import React, { useRef, useState } from "react";
import SubmissionsCalendarHeatmapMobile from "@/components/SubmissionsHeatmapMobile";
import { Feather } from "@expo/vector-icons";
import PerformanceGraph from "@/components/PerformanceGraph";
import StreaksView from "@/components/StreaksView";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SingleHabitPage() {
  const { singleHabit: singleHabitId } = useLocalSearchParams();

  const habitId = singleHabitId as DataModel["userHabits"]["document"]["_id"];

  const singleHabit = useQuery(api.habits.getAllSubmissionsForHabit, {
    habitId: habitId,
  });

  const [shareModalVisible, setShareModalVisible] = useState(false);
  const skiaRef = useRef<any>(null);

  const handleShare = async () => {
    if (skiaRef.current) {
      try {
        const image = skiaRef.current.makeImageSnapshot();
        if (image) {
          const base64 = image.encodeToBase64();
          const uri = `data:image/png;base64,${base64}`;
          await Share.share({
            url: uri,
            message: `Check out my progress on ${singleHabit?.habit.name}!`,
          });
        }
      } catch (error) {
        console.error("Error sharing image:", error);
      }
    }
  };

  if (singleHabit === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="py-4 flex-grow">
          <View className="px-4 pt-2 flex flex-row items-center justify-between">
            <Pressable onPress={() => { }} disabled>
              <Feather name="settings" size={20} color="#374151" />
            </Pressable>

            <Text className="text-lg font-bold text-gray-800">Habit</Text>
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

  if (singleHabit === null) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="p-4 flex-grow">
          <View className="px-4 pt-2 flex flex-row items-center justify-between">
            <Pressable onPress={() => { }} disabled>
              <Feather name="settings" size={20} color="#374151" />
            </Pressable>

            <Text className="text-lg font-bold text-gray-800">Habit</Text>
            <Pressable onPress={() => router.back()}>
              <XMarkIcon size={24} color="#374151" />
            </Pressable>
          </View>
          <View className="mt-4 items-center justify-center">
            <Text className="text-gray-400 text-sm">
              Could not find this habit 😢
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="py-4 flex-grow">
        <View className="px-4 py-2 flex flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <Pressable
              onPress={() => router.navigate(`/habits/edit/${singleHabitId}`)}
            >
              <Feather name="settings" size={20} color="#374151" />
            </Pressable>
            <Pressable onPress={() => setShareModalVisible(true)}>
              <ShareIcon size={20} color="#374151" />
            </Pressable>
          </View>

          <Text className="text-lg font-bold text-gray-800">
            {singleHabit.habit.name}
          </Text>
          <Pressable onPress={() => router.back()}>
            <XMarkIcon size={24} color="#374151" />
          </Pressable>
        </View>
        <ScrollView>
          <View className="mt-6 flex gap-2">
            <SubmissionsCalendarHeatmapMobile
              allSubmissions={singleHabit.allSubmissions ?? []}
              habit={singleHabit.habit}
            />

            {/* Performance Graph */}
            <View className="">
              <PerformanceGraph
                habitId={habitId}
                habitColor={singleHabit.habit.colour}
              />
            </View>
            <View className="">
              <StreaksView
                habitId={habitId}
                habitColor={singleHabit.habit.colour}
              />
            </View>
          </View>
        </ScrollView>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={shareModalVisible}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/80">
          <View className="bg-white p-4 rounded-xl items-center gap-4 w-[90%]">
            <Text className="text-lg font-bold text-gray-800 mb-2">
              Share Progress
            </Text>

            {/* <View className="overflow-hidden rounded-xl shadow-sm">
              <ShareableHabitHeatmap
                ref={skiaRef}
                habit={singleHabit.habit}
                allSubmissions={singleHabit.allSubmissions ?? []}
                width={300}
                height={200}
              />
            </View> */}

            <View className="flex-row gap-3 mt-2">
              <Pressable
                onPress={() => setShareModalVisible(false)}
                className="px-6 py-3 rounded-lg bg-gray-100 flex-1 items-center"
              >
                <Text className="text-gray-700 font-semibold">Close</Text>
              </Pressable>

              <Pressable
                onPress={handleShare}
                className="px-6 py-3 rounded-lg flex-row items-center justify-center gap-2 flex-1"
                style={{ backgroundColor: singleHabit.habit.colour }}
              >
                <ShareIcon size={20} color="white" />
                <Text className="text-white font-bold">Share</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
