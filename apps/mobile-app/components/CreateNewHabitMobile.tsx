import React, { useState } from "react";
import color from "color";
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
  name: z.string().min(1, "Habit name is required"),
  colour: z.string().min(1),
  habitQuestion: z.string().min(1),
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

export default function CreateNewHabitDialog() {
  const [modalVisible, setModalVisible] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      habitQuestion: "",
      colour: getRandomColourForNewHabit(),
    },
  });

  const viewer = useQuery(api.auth.viewer);

  const hasLifeTimeAccess =
    (viewer != null &&
      viewer.hasActivePurchase != null &&
      viewer.hasActivePurchase) ??
    false;

  const createHabit = useMutation(api.habits.createNewUserHabit);

  const handleCreateNewHabit = async (data: FormSchema) => {
    try {
      await createHabit({
        name: data.name,
        colour: data.colour,
        habitQuestion: data.habitQuestion,
      });

      form.reset({
        name: "",
        habitQuestion: "",
        colour: getRandomColourForNewHabit(),
      });
      setModalVisible(false);
      // You can add your success toast here
    } catch (error) {
      // You can add your error toast here
      Alert.alert("Error", "Failed to create habit");
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    form.reset({
      name: "",
      habitQuestion: "",
      colour: getRandomColourForNewHabit(),
    });
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = form;

  const selectedColour = watch("colour");

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
        <Feather name="plus-circle" size={18} color="#374151" />
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
            <View
              className="bg-white rounded-sm p-6 shadow-lg"
              style={{
                backgroundColor: color(form.watch("colour"))
                  .mix(color("white"), 0.6)
                  .hex(),
              }}
            >
              {/* Header */}
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-semibold text-gray-900">
                  Create a new habit
                </Text>
                <TouchableOpacity onPress={handleClose}>
                  <Feather name="x" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
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
                        className="border border-gray-300 rounded-sm p-3 text-base bg-white"
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
                        className={clsx(
                          "h-8 w-8 rounded-sm border border-black",
                          {
                            "border-black border-2":
                              habitColour === selectedColour,
                          },
                        )}
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
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Question*
                  </Text>
                  <Controller
                    control={control}
                    name="habitQuestion"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className="border border-gray-300 rounded-sm p-3 text-base bg-white"
                        placeholder="e.g. Did you workout today?"
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

                {/* Habit Type Section */}
                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Habit type*
                  </Text>
                  <View className="bg-gray-100 border-2 border-gray-600 rounded-sm p-3">
                    <Text className="font-medium">Yes or No</Text>
                    <Text className="text-xs text-gray-600 mt-1">
                      e.g. Did you workout today? Did you wake up early?
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500 mt-2">
                    More types coming soon...
                  </Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmit(handleCreateNewHabit)}
                  disabled={isSubmitting}
                  className={clsx(
                    "bg-primary rounded-sm p-4 flex-row justify-center items-center",
                    {
                      "opacity-50": isSubmitting,
                    },
                  )}
                >
                  <Feather name="plus-circle" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    {isSubmitting ? "Creating..." : "Create habit"}
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
