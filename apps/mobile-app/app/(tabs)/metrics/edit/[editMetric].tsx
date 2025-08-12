import {
  XMarkIcon,
  TrashIcon,
  ChevronDownIcon,
} from "react-native-heroicons/outline";
import React, { useMemo, useEffect, useState } from "react";
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
  Modal,
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
  name: z.string().min(1, "Metric name is required"),
  colour: z.string().min(1),
  unit: z.string().optional(),
  increment: z.enum(["1", "0.1", "0.01"]).optional(),
});

type FormSchema = z.output<typeof formSchema>;

export const metricsFormColourOptions = [
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

export default function EditMetricPage() {
  const [showIncrementModal, setShowIncrementModal] = useState(false);
  const { editMetric: singleMetricId } = useLocalSearchParams();
  const metricId =
    singleMetricId as DataModel["userMetrics"]["document"]["_id"];

  const singleMetricData = useQuery(api.userMetrics.queries.getSingleMetric, {
    id: metricId,
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      unit: "",
      increment: "1",
      colour: "#FF8A8A",
    },
  });

  const updateMetric = useMutation(api.userMetrics.mutations.updateMetric);
  const deleteMetric = useMutation(api.userMetrics.mutations.deleteMetric);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = form;

  // Reset form when metric data loads
  useEffect(() => {
    if (singleMetricData) {
      // Convert increment number back to string for the form
      let incrementValue = "1"; // default
      if (singleMetricData.increment !== undefined) {
        if (singleMetricData.increment === 1) incrementValue = "1";
        else if (singleMetricData.increment === 0.1) incrementValue = "0.1";
        else if (singleMetricData.increment === 0.01) incrementValue = "0.01";
        else incrementValue = singleMetricData.increment.toString();
      }

      reset({
        name: singleMetricData.name,
        unit: singleMetricData.unit || "",
        increment: incrementValue as "1" | "0.1" | "0.01",
        colour: singleMetricData.colour,
      });
    }
  }, [singleMetricData, reset]);

  const handleUpdateMetric = async (data: FormSchema) => {
    try {
      const rawIncrement = data.increment
        ? parseFloat(data.increment)
        : undefined;
      const valueType: "integer" | "float" | undefined =
        rawIncrement !== undefined
          ? rawIncrement % 1 !== 0
            ? "float"
            : "integer"
          : undefined;

      await updateMetric({
        metricId: metricId,
        name: data.name,
        colour: data.colour,
        unit: data.unit || undefined,
        increment: rawIncrement,
        valueType: valueType,
      });

      router.back();
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update metric. Please try again.");
    }
  };

  const handleDeleteMetric = () => {
    Alert.alert(
      "Delete Metric",
      "Are you sure you want to delete this metric? This will also delete all your data entries. This action cannot be undone.",
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
              await deleteMetric({ metricId: metricId });
              router.dismiss();
              router.replace("/metrics");
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert(
                "Error",
                "Failed to delete metric. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const selectedColour = watch("colour");
  const selectedIncrement = watch("increment");

  const pageColour = useMemo(() => {
    if (!selectedColour) return "#ffffff";
    return color(selectedColour).mix(color("white"), 0.8).hex();
  }, [selectedColour]);

  const getSelectedIncrementLabel = () => {
    const option = incrementOptions.find(
      (opt) => opt.value === selectedIncrement,
    );
    return option ? option.label : "Select precision";
  };

  if (!singleMetricData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4">Loading metric...</Text>
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
            Edit metric
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
                Update your metric details
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
                      className="border bg-white border-gray-300 rounded-md p-3"
                      placeholder="e.g. Weight, Focus Hours"
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

              {/* Unit Field */}
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
                      autoComplete="off"
                      keyboardType="default"
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

              {/* Colour Field */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Colour*
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {metricsFormColourOptions.map((metricColour) => (
                    <TouchableOpacity
                      key={metricColour}
                      onPress={() => setValue("colour", metricColour)}
                      className={clsx("h-10 w-10 rounded-md border-2", {
                        "border-gray-900": metricColour === selectedColour,
                        "border-gray-300": metricColour !== selectedColour,
                      })}
                      style={{
                        backgroundColor: metricColour,
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

              {/* Current Metric Info */}
              <View className="mb-6 bg-white/50 rounded-md p-4 border border-gray-200">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Current metric info
                </Text>
                <View className="space-y-1">
                  <Text className="text-sm text-gray-600">
                    <Text className="font-medium">Value Type:</Text>{" "}
                    {singleMetricData.valueType === "float"
                      ? "Decimal"
                      : singleMetricData.valueType === "integer"
                        ? "Whole Number"
                        : "Auto-detect"}
                  </Text>
                  {singleMetricData.unit && (
                    <Text className="text-sm text-gray-600">
                      <Text className="font-medium">Current Unit:</Text>{" "}
                      {singleMetricData.unit}
                    </Text>
                  )}
                  {singleMetricData.increment && (
                    <Text className="text-sm text-gray-600">
                      <Text className="font-medium">Current Increment:</Text>{" "}
                      {singleMetricData.increment}
                    </Text>
                  )}
                  {singleMetricData.updatedAt && (
                    <Text className="text-sm text-gray-600">
                      <Text className="font-medium">Last updated:</Text>{" "}
                      {new Date(
                        singleMetricData.updatedAt,
                      ).toLocaleDateString()}
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
                  onPress={handleSubmit(handleUpdateMetric)}
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
                        Update Metric
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Delete Button */}
              <TouchableOpacity
                onPress={handleDeleteMetric}
                className="bg-red-50 border border-red-200 rounded-md p-4 flex-row justify-center items-center"
              >
                <TrashIcon size={20} color="#EF4444" />
                <Text className="text-red-600 font-medium ml-2">
                  Delete Metric
                </Text>
              </TouchableOpacity>
            </View>
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
