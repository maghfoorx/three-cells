import { router } from "expo-router";
import { XMarkIcon } from "react-native-heroicons/outline";
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
} from "react-native";
import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
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
  increment: z.string().optional(), // input is string, parse to float
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

const getRandomColour = () =>
  colourOptions[Math.floor(Math.random() * colourOptions.length)];

export default function CreateNewMetricPage() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      colour: getRandomColour(),
      unit: "",
      increment: "",
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
                    className="border bg-white border-gray-300 rounded-md p-3 text-base"
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
                    className="border bg-white border-gray-300 rounded-md p-3 text-base"
                    placeholder="e.g. kg, hours, words"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </View>

            {/* Increment */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Increment
              </Text>
              <Controller
                control={control}
                name="increment"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    keyboardType="numeric"
                    className="border bg-white border-gray-300 rounded-md p-3 text-base"
                    placeholder="e.g. 1 or 0.1"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
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
    </SafeAreaView>
  );
}
