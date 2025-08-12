import { router } from "expo-router";
import { XMarkIcon, ChevronDownIcon } from "react-native-heroicons/outline";
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
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import clsx from "clsx";
import color from "color";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

const formSchema = z.object({
  name: z.string().min(1, "Metric name is required"),
  colour: z.string().min(1),
  unit: z.string().optional(),
  increment: z.enum(["1", "0.1", "0.01"]).optional(),
});

type FormSchema = z.output<typeof formSchema>;

const colourOptions = [
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

const incrementOptions = [
  {
    value: "1",
    label: "Whole numbers",
    description: "1, 2, 3, 4...",
  },
  {
    value: "0.1",
    label: "One decimal place",
    description: "1.0, 1.1, 1.2...",
  },
  {
    value: "0.01",
    label: "Two decimal places",
    description: "1.00, 1.01, 1.02...",
  },
];

const getRandomColour = () =>
  colourOptions[Math.floor(Math.random() * colourOptions.length)];

export default function CreateNewMetricPage() {
  const [showIncrementModal, setShowIncrementModal] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      colour: getRandomColour(),
      unit: "",
      increment: "1", // Default to whole numbers
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const selectedColour = watch("colour");
  const selectedIncrement = watch("increment");

  const pageColour = useMemo(
    () => color(selectedColour).mix(color("white"), 0.8).hex(),
    [selectedColour],
  );

  const createMetric = useMutation(
    api.userMetrics.mutations.createNewUserMetric,
  );

  const onSubmit = async (data: FormSchema) => {
    const rawIncrement = data.increment ? parseFloat(data.increment) : 1;
    const valueType: "integer" | "float" =
      rawIncrement % 1 !== 0 ? "float" : "integer";

    const formData = {
      name: data.name,
      colour: data.colour,
      unit: data.unit || undefined,
      increment: data.increment ? parseFloat(data.increment) : undefined,
      valueType: valueType,
    };

    try {
      await createMetric(formData);
      form.reset();
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to create metric");
    }
  };

  const getSelectedIncrementLabel = () => {
    const option = incrementOptions.find(
      (opt) => opt.value === selectedIncrement,
    );
    return option ? option.label : "Select precision";
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: pageColour }}>
      <View className="py-4 flex-grow">
        <View className="px-4 pt-2 flex flex-row items-center justify-between">
          <View className="w-6" />
          <Text className="text-xl font-semibold text-gray-900">
            New metric
          </Text>

          <Pressable onPress={router.back}>
            <XMarkIcon size={24} color="#374151" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          className="mt-4"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="px-6"
          >
            <Text className="text-gray-600 mb-6">
              Use this form to create a new metric you want to track daily.
            </Text>

            {/* Name */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Name*
              </Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border bg-white border-gray-300 rounded-md p-3"
                    placeholder="e.g. Weight, Focus Hours"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </Text>
              )}
            </View>

            {/* Unit */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Unit
              </Text>
              <Controller
                control={control}
                name="unit"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border bg-white border-gray-300 rounded-md p-3"
                    placeholder="e.g. kg, hours, words"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>

            {/* Number Precision */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Number precision
              </Text>
              <TouchableOpacity
                onPress={() => setShowIncrementModal(true)}
                className="border bg-white border-gray-300 rounded-md p-3 flex-row justify-between items-center"
              >
                <Text className="text-gray-900">
                  {getSelectedIncrementLabel()}
                </Text>
                <ChevronDownIcon size={20} color="#6B7280" />
              </TouchableOpacity>
              <Text className="text-xs text-gray-500 mt-1">
                How precise should your measurements be?
              </Text>
            </View>

            {/* Colour Selection */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Colour*
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {colourOptions.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setValue("colour", c)}
                    className={clsx("h-10 w-10 rounded-md border-2", {
                      "border-gray-900": c === selectedColour,
                      "border-gray-300": c !== selectedColour,
                    })}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className={`bg-blue-600 rounded-md p-4 flex-row justify-center items-center ${isSubmitting ? "opacity-50" : ""}`}
            >
              <Feather name="plus-circle" size={20} color="white" />
              <Text className="text-white font-medium ml-2">
                {isSubmitting ? "Creating..." : "Create metric"}
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </ScrollView>
      </View>

      {/* Increment Selection Modal */}
      <Modal
        visible={showIncrementModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowIncrementModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black bg-opacity-50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowIncrementModal(false)}
        >
          <TouchableOpacity
            className="bg-white mx-6 rounded-xl max-w-sm w-full"
            activeOpacity={1}
            onPress={() => {}} // Prevent modal close when tapping inside
          >
            <View className="p-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Choose number precision
              </Text>

              {incrementOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    setValue("increment", option.value as "1" | "0.1" | "0.01");
                    setShowIncrementModal(false);
                  }}
                  className={clsx(
                    "p-4 rounded-lg mb-2 border",
                    selectedIncrement === option.value
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200",
                  )}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 mb-1">
                        {option.label}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {option.description}
                      </Text>
                    </View>
                    {selectedIncrement === option.value && (
                      <Feather name="check" size={20} color="#3B82F6" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setShowIncrementModal(false)}
                className="mt-4 bg-gray-100 rounded-lg p-3"
              >
                <Text className="text-center text-gray-700 font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
