import { router } from "expo-router";
import { XMarkIcon } from "react-native-heroicons/outline";
import React, { useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import clsx from "clsx";
import color from "color";
import { SafeAreaView } from "react-native-safe-area-context";

const formSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  colour: z.string().min(1),
  habitQuestion: z.string().min(1, "Question is required"),
  enableNotifications: z.boolean(),
});

type FormSchema = z.output<typeof formSchema>;

export const habitsFormColourOptions = [
  "#FF8A8A",
  "#FFB974",
  "#F49FB6",
  "#FFF176",
  "#7BE495",
  "#B8FF66",
  "#8CFAC0",
  "#72D1F4",
  "#70D6FF",
  "#90BFFF",
  "#D59BF6",
  "#B980F0",
  "#F6A9FF",
];

const getRandomColourForNewHabit = () => {
  return habitsFormColourOptions[
    Math.floor(Math.random() * habitsFormColourOptions.length)
  ];
};

export default function CreateNewHabitPage() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      habitQuestion: "",
      colour: getRandomColourForNewHabit(),
      enableNotifications: true,
    },
  });

  const createHabit = useMutation(api.habits.createNewUserHabit);

  const handleCreateNewHabit = async (data: FormSchema) => {
    try {
      await createHabit({
        name: data.name,
        colour: data.colour,
        habitQuestion: data.habitQuestion,
        enableNotifications: data.enableNotifications,
      });

      form.reset();
      router.back();
      // You can add your success toast here
    } catch (error) {
      // You can add your error toast here
      Alert.alert("Error", "Failed to create habit");
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = form;

  const selectedColour = watch("colour");

  const pageColour = useMemo(() => {
    return color(selectedColour).mix(color("white"), 0.8).hex();
  }, [form.watch("colour")]);

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: pageColour,
      }}
    >
      <View className="py-4 flex-grow">
        <View className="px-4 pt-2 flex flex-row items-center justify-between">
          <View className="w-6" />
          <Text className="text-xl font-semibold text-gray-900">New habit</Text>

          <Pressable onPress={router.back}>
            <XMarkIcon size={24} color="#374151" />
          </Pressable>
        </View>

        <View className="flex-1 mt-4">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className=""
          >
            <View className="px-6">
              {/* Header */}

              <Text className="text-gray-600 mb-6">
                Use this form to create a new habit
              </Text>

              {/* Name Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Name*
                </Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="border bg-white border-gray-300 p-3 rounded-md"
                      placeholder="Workout"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoComplete="off"
                    />
                  )}
                />
                {errors.name && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </Text>
                )}
              </View>

              {/* Question Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Question*
                </Text>
                <Controller
                  control={control}
                  name="habitQuestion"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="border bg-white border-gray-300 rounded-md p-3 text-base min-h-[80px]"
                      placeholder="e.g. Did you workout today?"
                      multiline
                      textAlignVertical="top"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoComplete="off"
                    />
                  )}
                />
                {errors.habitQuestion && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.habitQuestion.message}
                  </Text>
                )}
              </View>

              {/* Colour Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Colour*
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {habitsFormColourOptions.map((habitColour) => (
                    <TouchableOpacity
                      key={habitColour}
                      onPress={() => setValue("colour", habitColour)}
                      className={clsx("h-10 w-10 rounded-md border-2", {
                        "border-gray-900": habitColour === selectedColour,
                        "border-gray-300": habitColour !== selectedColour,
                      })}
                      style={{
                        backgroundColor: habitColour,
                      }}
                    />
                  ))}
                </View>
                {errors.colour && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.colour.message}
                  </Text>
                )}
              </View>

              {/* Notifications Field */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Notifications
                </Text>
                <View className="bg-white border border-gray-300 rounded-md p-3">
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1 mr-4">
                      <Text className="text-base font-medium text-gray-900">
                        Enable Notifications
                      </Text>
                      <Text className="text-sm text-gray-600 mt-1">
                        Get reminders to complete this habit
                      </Text>
                    </View>
                    <Controller
                      control={control}
                      name="enableNotifications"
                      render={({ field: { onChange, value } }) => (
                        <Switch
                          value={value}
                          onValueChange={onChange}
                          trackColor={{ false: "#d1d5db", true: "#10b981" }}
                          thumbColor={value ? "#ffffff" : "#ffffff"}
                        />
                      )}
                    />
                  </View>
                </View>
              </View>

              {/* Habit Type Section */}
              {/* <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Habit type*
              </Text>
              <View className="bg-gray-100 border-2 border-gray-600 rounded-md p-3">
                <Text className="font-medium">Yes or No</Text>
                <Text className="text-xs text-gray-600 mt-1">
                  e.g. Did you workout today? Did you wake up early?
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-2">
                More types coming soon...
              </Text>
            </View> */}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit(handleCreateNewHabit)}
                disabled={isSubmitting}
                className={`bg-blue-600 rounded-md p-4 flex-row justify-center items-center ${isSubmitting ? "opacity-50" : ""}`}
              >
                <Feather name="plus-circle" size={20} color="white" />
                <Text className="text-white font-medium ml-2">
                  {isSubmitting ? "Creating..." : "Create habit"}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </SafeAreaView>
  );
}
