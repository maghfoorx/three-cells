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

export default function CreateNewTaskDialog() {
  const [modalVisible, setModalVisible] = useState(false);

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
      setModalVisible(false);
      // You can add your success toast here
    } catch (error) {
      // You can add your error toast here
      Alert.alert("Error", "Failed to create task");
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    form.reset();
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <>
      {/* Trigger Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        disabled={!hasLifeTimeAccess}
        className={clsx("p-3 border border-gray-300 rounded-sm", {
          "opacity-50": !hasLifeTimeAccess,
        })}
      >
        <Feather name="clipboard" size={18} color="#374151" />
      </TouchableOpacity>

      {/* Modal Dialog */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="w-full max-w-md mx-4"
          >
            <View className="bg-white rounded-lg p-6 shadow-lg">
              {/* Header */}
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-semibold text-gray-900">
                  New Task
                </Text>
                <TouchableOpacity onPress={handleClose}>
                  <Feather name="x" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text className="text-gray-600 mb-6">
                Use this form to create a new task
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
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
                        className="border border-gray-300 rounded-lg p-3 text-base min-h-[80px]"
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
                        className="border border-gray-300 rounded-lg p-3 text-base min-h-[120px]"
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
                  className={`bg-blue-600 rounded-lg p-4 flex-row justify-center items-center ${isSubmitting ? "opacity-50" : ""}`}
                >
                  <Feather name="clipboard" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    {isSubmitting ? "Adding..." : "Add Task"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}
