import { router, useLocalSearchParams } from "expo-router";
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
  SafeAreaView,
  Pressable,
  Vibration,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { format } from "date-fns";
import color from "color";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { formatValueByIncrement } from "@/utils/numbers";
import DualValuePicker from "@/components/pages/metrics/DualWheelPicker";

const formSchema = z.object({
  value: z.number().min(0, "Value must be positive"),
  note: z.string().optional(),
});

type FormSchema = z.output<typeof formSchema>;

export default function AddMetricEntryPage() {
  const { metricId } = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState(false);

  const metric = useQuery(api.userMetrics.queries.getMetricById, {
    metricId: metricId as Id<"userMetrics">,
  });

  const latestEntry = useQuery(api.userMetrics.queries.latestMetricEntry, {
    metricId: metricId as Id<"userMetrics">,
  });

  const createMetricEntry = useMutation(
    api.userMetrics.mutations.createMetricEntry,
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: 0,
      note: "",
    },
  });

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const currentValue = watch("value");

  const increment = metric?.increment || 1;
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (latestEntry?.value !== undefined && latestEntry.value > 0) {
      setValue("value", latestEntry.value);
    }
  }, [latestEntry, setValue]);

  const handleDirectEdit = () => {
    setIsEditing(true);
  };

  const handleCreateEntry = async (data: FormSchema) => {
    try {
      await createMetricEntry({
        metricId: metricId as Id<"userMetrics">,
        value: data.value,
        dateFor: today,
        note: data.note,
      });

      form.reset();
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to create entry");
    }
  };

  if (!metric) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 py-4 flex flex-row items-center justify-between">
          <View className="w-6" />
          <Text className="text-lg font-semibold text-gray-900">Add Entry</Text>
          <Pressable onPress={router.back}>
            <XMarkIcon size={24} color="#6B7280" />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 px-6">
            {/* Metric Info */}
            <View className="items-center mb-8">
              <View className="flex-row items-center gap-3 mb-2">
                <View
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: metric.colour }}
                />
                <Text className="text-xl font-semibold text-gray-900">
                  {metric.name}
                </Text>
              </View>
              <Text className="text-gray-500">
                {format(new Date(), "EEEE, MMMM do")}
              </Text>
            </View>

            {/* Value Selector */}
            <View className="flex-1 items-center justify-center">
              <View
                className="rounded-2xl p-8 mb-8 min-w-[280px]"
                style={{
                  backgroundColor: color(metric.colour)
                    .mix(color("white"), 0.95)
                    .hex(),
                  borderColor: color(metric.colour)
                    .mix(color("white"), 0.8)
                    .hex(),
                  borderWidth: 2,
                }}
              >
                {/* Value Display */}
                <View className="items-center mb-6">
                  {isEditing ? (
                    <Controller
                      control={control}
                      name="value"
                      render={({ field: { onChange, onBlur, value } }) => {
                        const [inputText, setInputText] = useState(
                          value?.toString() || "",
                        );

                        const maxDecimals =
                          increment < 1 ? Math.abs(Math.log10(increment)) : 0;

                        const validateAndUpdate = (text: string) => {
                          // Empty input
                          if (text === "") {
                            setInputText("");
                            return;
                          }

                          // Only allow valid decimal inputs
                          if (!/^\d*\.?\d*$/.test(text)) return;

                          const [_, decimal = ""] = text.split(".");
                          if (decimal.length > maxDecimals) return;

                          setInputText(text);
                        };

                        const commitValue = () => {
                          const parsed = parseFloat(inputText);
                          console.log(parsed, "IS_PARSED_VALUE");
                          if (!isNaN(parsed) && parsed >= 0) {
                            const rounded = formatValueByIncrement(
                              parsed,
                              increment,
                            );
                            setValue("value", parsed);
                            setInputText(parsed.toString());
                          } else {
                            setInputText("0");
                            setValue("value", 0);
                          }
                          setIsEditing(false);
                        };

                        return (
                          <TextInput
                            value={inputText}
                            onChangeText={validateAndUpdate}
                            onBlur={commitValue}
                            onSubmitEditing={commitValue}
                            keyboardType="decimal-pad"
                            autoFocus
                            selectTextOnFocus
                            className="font-bold text-center"
                            style={{
                              color: color(metric.colour)
                                .mix(color("black"), 0.1)
                                .hex(),
                              fontSize: 40,
                              lineHeight: 48,
                            }}
                          />
                        );
                      }}
                    />
                  ) : (
                    <Pressable onPress={handleDirectEdit}>
                      <Text
                        className="font-bold text-center"
                        style={{
                          color: color(metric.colour)
                            .mix(color("black"), 0.1)
                            .hex(),
                          fontSize: 40,
                          lineHeight: 48,
                        }}
                      >
                        {currentValue}
                      </Text>
                    </Pressable>
                  )}
                  {metric.unit && (
                    <Text className="text-xl text-gray-500 mt-2">
                      {metric.unit}
                    </Text>
                  )}
                </View>

                <DualValuePicker
                  value={currentValue}
                  onChange={(newValue) => setValue("value", newValue)}
                  increment={increment}
                  colorHex={metric.colour}
                />
              </View>
            </View>

            {/* Note Field */}
            {/* <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Note (optional)
              </Text>
              <Controller
                control={control}
                name="note"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border border-gray-300 rounded-md p-3 text-base min-h-[80px]"
                    placeholder="Add a note..."
                    multiline
                    textAlignVertical="top"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoComplete="off"
                  />
                )}
              />
            </View> */}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(handleCreateEntry)}
              disabled={isSubmitting}
              className={`rounded-md p-4 flex-row justify-center items-center mb-8 ${
                isSubmitting ? "bg-gray-300" : ""
              }`}
              style={{
                backgroundColor: isSubmitting ? "#D1D5DB" : metric.colour,
              }}
            >
              <Feather
                name="check"
                size={20}
                style={{
                  color: color(metric.colour).isDark() ? "#FFFF" : "#000",
                }}
              />
              <Text
                className={"font-medium ml-2"}
                style={{
                  color: color(metric.colour).isDark() ? "#FFFF" : "#000",
                }}
              >
                {isSubmitting ? "Adding..." : "Add Entry"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
