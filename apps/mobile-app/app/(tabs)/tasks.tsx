import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const SAMPLE_TASKS: Task[] = [
  { id: 1, text: "Review project proposal", completed: false },
  { id: 2, text: "Call dentist for appointment", completed: true },
  { id: 3, text: "Buy groceries for the week", completed: false },
  { id: 4, text: "Finish reading chapter 5", completed: false },
];

export default function TasksPage() {
  const userTasks = useQuery(api.tasks.getAllUserTasks);

  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS);
  const [newTask, setNewTask] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          text: newTask.trim(),
          completed: false,
        },
      ]);
      setNewTask("");
    }
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const totalCount = tasks.length;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-gray-900">Tasks</Text>
          <Text className="text-gray-600 mt-1">
            {completedCount} of {totalCount} completed
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="px-6 pb-6">
          <View className="bg-gray-200 rounded-full h-2">
            <View
              className="bg-purple-600 rounded-full h-2"
              style={{
                width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
              }}
            />
          </View>
        </View>

        {/* Add Task Input */}
        <View className="px-6 pb-6">
          <View className="bg-gray-50 rounded-2xl p-4 flex-row items-center gap-3">
            <TextInput
              value={newTask}
              onChangeText={setNewTask}
              placeholder="Add a new task..."
              className="flex-1 text-gray-900 font-medium"
              returnKeyType="done"
              onSubmitEditing={addTask}
            />
            <TouchableOpacity
              onPress={addTask}
              className="w-8 h-8 bg-purple-600 rounded-full items-center justify-center"
              activeOpacity={0.8}
            >
              <Feather name="plus" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tasks List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-6"
        >
          <View className="gap-3 pb-8">
            {userTasks?.map((task) => (
              <Animated.View
                key={task._id}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
              >
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity
                    onPress={() => toggleTask(task._id)}
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      task.is_completed
                        ? "bg-purple-600 border-purple-600"
                        : "border-gray-300"
                    }`}
                    activeOpacity={0.7}
                  >
                    {task.is_completed && (
                      <Feather name="check" size={14} color="white" />
                    )}
                  </TouchableOpacity>

                  <Text
                    className={`flex-1 font-medium ${
                      task.is_completed
                        ? "text-gray-400 line-through"
                        : "text-gray-900"
                    }`}
                  >
                    {task.title}
                  </Text>

                  <TouchableOpacity
                    onPress={() => deleteTask(task._id as any)}
                    className="p-2"
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
