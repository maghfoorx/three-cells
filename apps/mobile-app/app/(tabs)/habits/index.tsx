import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { PlusIcon } from "react-native-heroicons/outline";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import UserHabitCardMobile from "@/components/UserHabitCardMobile";
import { router } from "expo-router";
import LoadingScreen from "@/components/LoadingScreen";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HabitsPage() {
  const allUserHabits = useQuery(api.habits.getAllUserHabits);

  if (allUserHabits === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="px-6 py-4 flex flex-row justify-between items-center bg-white">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Habits</Text>
            <Text className="text-base text-gray-500 mt-1">
              - active habits
            </Text>
          </View>
          <Pressable
            onPress={() => router.navigate("/create-new-habit")}
            className="w-12 h-12 rounded-md bg-white/80 items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
            disabled
          >
            <PlusIcon size={20} color="#6B7280" />
          </Pressable>
        </View>
        <LoadingScreen pictureName="habits-loading.png" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex flex-row justify-between items-center bg-white">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Habits</Text>
            <Text className="text-base text-gray-500 mt-1">
              {allUserHabits.length} active habits
            </Text>
          </View>
          <Pressable
            onPress={() => router.navigate("/create-new-habit")}
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
          <View className="gap-4">
            {allUserHabits.map((habit) => {
              return <UserHabitCardMobile key={habit._id} habit={habit} />;
            })}

            {/* Empty state */}
            {allUserHabits.length === 0 && (
              <View className="flex-1 items-center justify-center mt-20">
                <View className="w-[200px] h-[200px] rounded-full bg-gray-100 items-center justify-center mb-4">
                  <Image
                    source={require("../../../assets/images/habits-loading.png")}
                    transition={300}
                    contentFit="contain"
                    style={{
                      width: 200,
                      height: 200,
                    }}
                  />
                </View>
                <Text className="text-lg font-semibold text-gray-900 mb-2">
                  No habits yet
                </Text>
                <Text className="text-gray-500 text-center px-8">
                  Create your first habit to start building better daily
                  routines
                </Text>

                <Pressable
                  onPress={() => router.navigate("/create-new-habit")}
                  className="mt-2 bg-blue-600 px-6 py-3 rounded-lg"
                >
                  <Text className="text-white font-semibold">Create Habit</Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
