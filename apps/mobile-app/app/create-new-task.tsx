import { router } from "expo-router";
import { XMarkIcon } from "react-native-heroicons/outline";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import clsx from "clsx";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category_id: z.string().optional(),
});

type FormSchema = z.output<typeof formSchema>;

export default function CreateNewTaskPage() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
    },
  });

  const viewer = useQuery(api.auth.viewer);

  const hasLifeTimeAccess =
    (viewer != null &&
      viewer.hasActivePurchase != null &&
      viewer.hasActivePurchase) ??
    false;

  const createNewTask = useMutation(api.tasks.createUserTask);

  const handleCreateNewTask = async (data: FormSchema) => {
    try {
      await createNewTask({
        title: data.title,
        description: data.description,
        // category_id: data.category_id as any,
      });

      form.reset();
      router.back();
      // You can add your success toast here
    } catch (error) {
      // You can add your error toast here
      Alert.alert("Error", "Failed to create task");
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <SafeAreaView className="flex-1">
      <View className="px-6 py-4 flex flex-row items-center justify-end">
        <View>
          <Pressable onPress={router.back}>
            <Text>
              <XMarkIcon size={20} />
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className=""
        >
          <View className="px-6">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold text-gray-900">
                New task
              </Text>
            </View>

            <Text className="text-gray-600 mb-6">
              Use this form to create a new task
            </Text>

            {/* Title Field */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Task*
              </Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border border-gray-300 rounded-md p-3 text-base min-h-[80px]"
                    placeholder="What's there to do?"
                    multiline
                    textAlignVertical="top"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoComplete="off"
                  />
                )}
              />
              {errors.title && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </Text>
              )}
            </View>

            {/* Description Field */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Description
              </Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border border-gray-300 rounded-md p-3 text-base min-h-[120px]"
                    placeholder="Any extra info..."
                    multiline
                    textAlignVertical="top"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoComplete="off"
                  />
                )}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(handleCreateNewTask)}
              disabled={isSubmitting}
              className={`bg-blue-600 rounded-md p-4 flex-row justify-center items-center ${isSubmitting ? "opacity-50" : ""}`}
            >
              <Feather name="clipboard" size={20} color="white" />
              <Text className="text-white font-medium ml-2">
                {isSubmitting ? "Adding..." : "Add Task"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
