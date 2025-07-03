import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import UserTaskTile from "@/components/UserTaskTileMobile";
import CreateNewTaskDialog from "@/components/CreateNewTaskMobile";

export default function TasksPage() {
  const [openCreateTaskModal, setOpenCreateTaskModal] = useState(false);
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

  if (userTasks === undefined) {
    return (
      <SafeAreaView className="flex-1 bg-white px-2">
        <View className="flex flex-row items-center justify-between">
          <View className="items-left">
            <Text className="text-2xl font-bold text-gray-800">Tasks</Text>
          </View>
        </View>

        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4 flex-grow">
        <View className="flex flex-row justify-between">
          <View className="items-left">
            <Text className="text-2xl font-bold text-gray-800">Tasks</Text>
          </View>
          <View>
            <CreateNewTaskDialog />
          </View>
        </View>
        <View className="mt-4 flex gap-2">
          {userTasks.map((task) => {
            return (
              <UserTaskTile
                key={task._id}
                userTask={task}
                recentlyCompleted={recentCompletedTaskIds.has(task._id)}
              />
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}
