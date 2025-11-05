import { router } from "expo-router";
import { XMarkIcon } from "react-native-heroicons/outline";
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
  InputAccessoryView,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { SafeAreaView } from "react-native-safe-area-context";

const KEYBOARD_TOOLBAR_ID = "keyboard_toolbar_create_task";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category_id: z.string().optional(),
});

type FormSchema = z.output<typeof formSchema>;

export default function CreateNewTaskPage() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
    },
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

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
      <View className="py-4 flex-grow">
        <View className="px-4 pt-2 flex flex-row items-center justify-between">
          <View className="w-6" />
          <Text className="text-xl font-semibold text-gray-900">New task</Text>

          <Pressable onPress={router.back}>
            <XMarkIcon size={24} color="#374151" />
          </Pressable>
        </View>

        <View className="flex-1 mt-4">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <View className="flex-1 flex-col justify-between px-6">
              <View>
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
                        inputAccessoryViewID={
                          Platform.OS === "ios"
                            ? KEYBOARD_TOOLBAR_ID
                            : undefined
                        }
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
                        inputAccessoryViewID={
                          Platform.OS === "ios"
                            ? KEYBOARD_TOOLBAR_ID
                            : undefined
                        }
                      />
                    )}
                  />
                </View>
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

            {/* Keyboard Toolbar (iOS only) */}
            {Platform.OS === "ios" && (
              <InputAccessoryView nativeID={KEYBOARD_TOOLBAR_ID}>
                <View
                  className="flex-row justify-end items-center px-4 py-2"
                  style={{
                    minHeight: 44,
                    backgroundColor: "transparent",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => Keyboard.dismiss()}
                    className="px-4 py-2 bg-blue-600 rounded-full"
                    style={{
                      shadowColor: "#3B82F6",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <Text className="text-white font-semibold text-base">
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
              </InputAccessoryView>
            )}

            {/* Android Keyboard Toolbar */}
            {Platform.OS === "android" && isKeyboardVisible && (
              <View
                className="absolute bottom-0 left-0 right-0 flex-row justify-end items-center px-4 py-2 border-t border-gray-200"
                style={{
                  minHeight: 44,
                  backgroundColor: "#ffffff",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsKeyboardVisible(false);
                  }}
                  className="px-4 py-2 bg-blue-600 rounded-md"
                  style={{
                    shadowColor: "#3B82F6",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text className="text-white font-semibold text-base">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        </View>
      </View>
    </SafeAreaView>
  );
}
