import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useLocalSearchParams, router } from "expo-router";
import {
  XMarkIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
} from "react-native-heroicons/outline";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import clsx from "clsx";
import { SafeAreaView } from "react-native-safe-area-context";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type FormSchema = z.output<typeof formSchema>;

export default function SingleTaskPage() {
  const { singleTask: singleTaskId } = useLocalSearchParams();
  const taskId = singleTaskId as unknown as Id<"user_tasks">;
  const [isEditing, setIsEditing] = useState(false);

  const singleTask = useQuery(api.tasks.getSingleTask, {
    id: taskId,
  });

  const updateTask = useMutation(api.tasks.updateTask);
  const deleteTask = useMutation(api.tasks.deleteUserTask);
  const toggleTaskCompletion = useMutation(api.tasks.toggleUserTaskCompletion);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = form;

  useEffect(() => {
    if (singleTask) {
      reset({
        title: singleTask.title,
        description: singleTask.description || "",
      });
    }
  }, [singleTask, reset]);

  const onSubmit = async (values: FormSchema) => {
    try {
      await updateTask({
        id: taskId,
        title: values.title,
        description: values.description,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update task. Please try again.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTask({ taskId: taskId });
              router.back();
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete task. Please try again.");
            }
          },
        },
      ],
    );
  };

  const handleToggleCompletion = async () => {
    try {
      await toggleTaskCompletion({ taskId: taskId });
    } catch (error) {
      console.error("Toggle completion error:", error);
      Alert.alert("Error", "Failed to update task status. Please try again.");
    }
  };

  const handleCancel = () => {
    if (singleTask) {
      reset({
        title: singleTask.title,
        description: singleTask.description || "",
      });
    }
    setIsEditing(false);
  };

  if (!singleTask) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4">Loading task...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 py-4"
      >
        {/* Header */}
        <View className="px-4 pt-2 flex flex-row items-center justify-between">
          {!isEditing ? (
            <View className="flex-row items-center gap-1">
              <Pressable onPress={() => setIsEditing(true)} className="p-2">
                <PencilIcon size={20} color="#374151" />
              </Pressable>
            </View>
          ) : (
            <View className="w-6" />
          )}

          <Text className="text-lg font-semibold text-gray-900">
            {isEditing ? "Edit Task" : "Task Details"}
          </Text>
          <Pressable onPress={router.back}>
            <XMarkIcon size={24} color="#374151" />
          </Pressable>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
          {!isEditing ? (
            // View Mode
            <>
              {/* Task Status */}
              <View className="mb-6">
                <TouchableOpacity
                  onPress={handleToggleCompletion}
                  className={clsx(
                    "flex-row items-center p-4 rounded-md border-2",
                    singleTask.is_completed
                      ? "bg-green-50 border-green-200"
                      : "bg-blue-50 border-blue-200",
                  )}
                >
                  <View
                    className={clsx(
                      "w-6 h-6 rounded-full border-2 items-center justify-center mr-3",
                      singleTask.is_completed
                        ? "bg-green-500 border-green-500"
                        : "border-blue-300",
                    )}
                  >
                    {singleTask.is_completed && (
                      <CheckIcon size={16} color="white" />
                    )}
                  </View>
                  <Text
                    className={clsx(
                      "flex-1 font-medium",
                      singleTask.is_completed
                        ? "text-green-700"
                        : "text-blue-700",
                    )}
                  >
                    {singleTask.is_completed ? "Completed" : "Mark as complete"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Task Title */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-500 mb-2">
                  TITLE
                </Text>
                <View className="bg-white rounded-md p-4 border border-gray-200">
                  <Text
                    className={clsx(
                      "text-lg font-medium",
                      singleTask.is_completed
                        ? "text-gray-500 line-through"
                        : "text-gray-900",
                    )}
                  >
                    {singleTask.title}
                  </Text>
                </View>
              </View>

              {/* Task Description */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-500 mb-2">
                  DESCRIPTION
                </Text>
                <View className="bg-white rounded-md p-4 border border-gray-200 min-h-32">
                  <Text
                    className={clsx(
                      "text-base leading-6",
                      singleTask.is_completed
                        ? "text-gray-500"
                        : "text-gray-700",
                    )}
                  >
                    {singleTask.description || "No description provided"}
                  </Text>
                </View>
              </View>

              {/* Task Metadata */}
              <View className="bg-white rounded-md p-4 border border-gray-200">
                <Text className="text-sm font-medium text-gray-500 mb-3">
                  TASK INFO
                </Text>
                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Created</Text>
                    <Text className="text-gray-900">
                      {format(new Date(singleTask.updated_at), "MMM dd, yyyy")}
                    </Text>
                  </View>
                  {singleTask.completed_at && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600">Completed</Text>
                      <Text className="text-gray-900">
                        {format(
                          new Date(singleTask.completed_at),
                          "MMM dd, yyyy",
                        )}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Delete Button */}
              <TouchableOpacity
                onPress={handleDelete}
                className="mt-4 bg-red-50 border border-red-200 rounded-md p-4 flex-row justify-center items-center"
              >
                <TrashIcon size={20} color="#EF4444" />
                <Text className="text-red-600 font-medium ml-2">
                  Delete task
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            // Edit Mode
            <>
              {/* Title Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Title *
                </Text>
                <Controller
                  control={control}
                  name="title"
                  render={({ field }) => (
                    <View>
                      <TextInput
                        placeholder="Enter task title"
                        value={field.value}
                        onChangeText={field.onChange}
                        className="bg-white rounded-md leading-5 px-4 py-3 border border-gray-200 text-base text-gray-900"
                        placeholderTextColor="#9CA3AF"
                        textAlignVertical="top"
                      />
                      {errors.title && (
                        <Text className="text-red-500 text-sm mt-2 ml-1">
                          {errors.title.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              {/* Description Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Description
                </Text>
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <TextInput
                      multiline
                      placeholder="Enter task description (optional)"
                      value={field.value}
                      onChangeText={field.onChange}
                      className="bg-white rounded-md px-4 py-4 border border-gray-200 text-base text-gray-900 min-h-32"
                      placeholderTextColor="#9CA3AF"
                      textAlignVertical="top"
                    />
                  )}
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleCancel}
                  className="flex-1 bg-gray-100 rounded-md py-4 items-center justify-center"
                >
                  <Text className="text-gray-700 text-base font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className={clsx(
                    "flex-1 bg-blue-600 rounded-md py-4 items-center justify-center",
                    isSubmitting ? "opacity-70" : "",
                  )}
                >
                  {isSubmitting ? (
                    <View className="flex-row items-center gap-2">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white text-base font-medium">
                        Saving...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-white text-base font-medium">
                      Save Changes
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
