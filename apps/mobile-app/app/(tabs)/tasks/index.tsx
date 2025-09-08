import React, { useMemo } from "react";
import { View, Text, SafeAreaView, ScrollView, Pressable } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import UserTaskTile from "@/components/UserTaskTileMobile";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { PlusIcon } from "react-native-heroicons/outline";
import LoadingScreen from "@/components/LoadingScreen";

export default function TasksPage() {
  const userTasks = useQuery(api.tasks.getAllUserTasks);

  const recentCompletedTaskIds = useMemo(() => {
    if (!userTasks) return new Set();
    const completedTasks = userTasks
      .filter((task) => task.is_completed && task.completed_at)
      .sort((a, b) => (b.completed_at ?? 0) - (a.completed_at ?? 0))
      .slice(0, 2)
      .map((task) => task._id);
    return new Set(completedTasks);
  }, [userTasks]);

  const { completedTasks, pendingTasks } = useMemo(() => {
    if (!userTasks) return { completedTasks: [], pendingTasks: [] };

    const completed = userTasks.filter((task) => task.is_completed);
    const pending = userTasks.filter((task) => !task.is_completed);

    return { completedTasks: completed, pendingTasks: pending };
  }, [userTasks]);

  if (userTasks === undefined) {
    return <LoadingScreen pictureName="todos-loading.png" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Tasks</Text>
            <Text className="text-base text-gray-600 mt-1">
              {pendingTasks.length} pending, {completedTasks.length} completed
            </Text>
          </View>
          {/* <CreateNewTaskDialog /> */}
          <Pressable
            onPress={() => router.navigate("/create-new-task")}
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
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <View className="mt-4">
              <Text className="font-semibold text-gray-900 mb-4">To do</Text>
              <View className="gap-3">
                {pendingTasks.map((task) => (
                  <UserTaskTile
                    key={task._id}
                    userTask={task}
                    recentlyCompleted={recentCompletedTaskIds.has(task._id)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <View className="mt-8">
              <Text className="font-semibold text-gray-900 mb-4">
                Completed
              </Text>
              <View className="gap-3">
                {completedTasks.map((task) => (
                  <UserTaskTile
                    key={task._id}
                    userTask={task}
                    recentlyCompleted={recentCompletedTaskIds.has(task._id)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {userTasks.length === 0 && (
            <View className="flex-1 items-center justify-center mt-20">
              <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-6">
                <Feather name="check-circle" size={32} color="#3B82F6" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">
                No tasks yet
              </Text>
              <Text className="text-gray-600 text-center mb-8 px-8">
                Create your first task to get started with organizing your day
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
