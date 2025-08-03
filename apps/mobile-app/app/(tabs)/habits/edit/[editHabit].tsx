import { XMarkIcon, TrashIcon } from "react-native-heroicons/outline";
import React, { useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { useLocalSearchParams, router } from "expo-router";
import { DataModel } from "@packages/backend/convex/_generated/dataModel";
import clsx from "clsx";
import color from "color";

const formSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  colour: z.string().min(1),
  habitQuestion: z.string().min(1, "Question is required"),
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

export default function EditHabitPage() {
  const { editHabit: singleHabitId } = useLocalSearchParams();
  const habitId = singleHabitId as DataModel["userHabits"]["document"]["_id"];

  const singleHabitData = useQuery(api.habits.getSingleHabit, {
    id: habitId,
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      habitQuestion: "",
      colour: "#FF8A8A",
    },
  });

  const updateHabit = useMutation(api.habits.updateHabit);
  const deleteHabit = useMutation(api.habits.deleteHabit);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = form;

  // Reset form when habit data loads
  useEffect(() => {
    if (singleHabitData) {
      reset({
        name: singleHabitData.name,
        habitQuestion: singleHabitData.habitQuestion,
        colour: singleHabitData.colour,
      });
    }
  }, [singleHabitData, reset]);

  const handleUpdateHabit = async (data: FormSchema) => {
    try {
      await updateHabit({
        habitId: habitId,
        name: data.name,
        colour: data.colour,
        habitQuestion: data.habitQuestion,
      });

      router.back();
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update habit. Please try again.");
    }
  };

  const handleDeleteHabit = () => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit? This will also delete all your progress data. This action cannot be undone.",
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
              await deleteHabit({ habitId: habitId });
              router.dismiss();
              router.replace("/habits");
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete habit. Please try again.");
            }
          },
        },
      ],
    );
  };

  const selectedColour = watch("colour");

  const pageColour = useMemo(() => {
    if (!selectedColour) return "#ffffff";
    return color(selectedColour).mix(color("white"), 0.8).hex();
  }, [selectedColour]);

  if (!singleHabitData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4">Loading habit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: pageColour,
      }}
    >
      <View className="py-4 flex-grow">
        {/* Header */}
        <View className="px-4 pt-2 flex flex-row items-center justify-between">
          <View className="w-6" />
          <Text className="text-lg font-semibold text-gray-900">
            Edit habit
          </Text>
          <Pressable onPress={router.back} className="">
            <XMarkIcon size={24} color="#374151" />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 mt-4"
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className=""
          >
            <View className="px-6">
              <Text className="text-gray-600 mb-6">
                Update your habit details
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
                      className="border bg-white border-gray-300 rounded-md p-3 text-base"
                      placeholder="Workout"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoComplete="off"
                      keyboardType="default"
                    />
                  )}
                />
                {errors.name && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.name.message}
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

              {/* Question Field */}
              <View className="mb-6">
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
                      keyboardType="default"
                    />
                  )}
                />
                {errors.habitQuestion && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.habitQuestion.message}
                  </Text>
                )}
              </View>

              {/* Current Habit Info */}
              <View className="mb-6 bg-white/50 rounded-md p-4 border border-gray-200">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Current habit info
                </Text>
                <View className="space-y-1">
                  <Text className="text-sm text-gray-600">
                    <Text className="font-medium">Type:</Text>{" "}
                    {singleHabitData.type === "yes_no"
                      ? "Yes/No"
                      : singleHabitData.type}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    <Text className="font-medium">Frequency:</Text>{" "}
                    {singleHabitData.frequency.mode}
                  </Text>
                  {singleHabitData.updatedAt && (
                    <Text className="text-sm text-gray-600">
                      <Text className="font-medium">Last updated:</Text>{" "}
                      {new Date(singleHabitData.updatedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3 mb-4">
                <TouchableOpacity
                  onPress={router.back}
                  className="flex-1 bg-gray-100 rounded-md p-4 items-center justify-center"
                >
                  <Text className="text-gray-700 font-medium">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit(handleUpdateHabit)}
                  disabled={isSubmitting}
                  className={clsx(
                    "flex-1 bg-blue-600 rounded-md p-4 flex-row justify-center items-center",
                    isSubmitting ? "opacity-50" : "",
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white font-medium ml-2">
                        Updating...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Feather name="check" size={20} color="white" />
                      <Text className="text-white font-medium ml-2">
                        Update Habit
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Delete Button */}
              <TouchableOpacity
                onPress={handleDeleteHabit}
                className="bg-red-50 border border-red-200 rounded-md p-4 flex-row justify-center items-center"
              >
                <TrashIcon size={20} color="#EF4444" />
                <Text className="text-red-600 font-medium ml-2">
                  Delete Habit
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
