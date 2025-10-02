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
  Pressable,
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";

const formSchema = z.object({
  value: z.number().min(0, "Value must be positive"),
  note: z.string().optional(),
});

type FormSchema = z.output<typeof formSchema>;

export default function AddMetricEntryPage() {
  const { metricId } = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [tempDate, setTempDate] = useState(new Date());

  const metric = useQuery(api.userMetrics.queries.getMetricById, {
    metricId: metricId as Id<"userMetrics">,
  });

  // Updated to fetch entry for the selected date
  const latestEntry = useQuery(api.userMetrics.queries.latestMetricEntry, {
    metricId: metricId as Id<"userMetrics">,
  });

  const entryForSelectedDate = useQuery(
    api.userMetrics.queries.getEntryForSelectedDate,
    {
      metricId: metricId as Id<"userMetrics">,
      date: format(selectedDate, "yyyy-MM-dd"), // Pass the selected date
    },
  );

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
  const selectedDateString = format(selectedDate, "yyyy-MM-dd");

  const isToday =
    format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (isToday) {
      // For today's date, use the latest entry to pre-fill the form
      if (latestEntry?.value !== undefined && latestEntry.value > 0) {
        setValue("value", latestEntry.value);
      } else {
        setValue("value", 0);
      }
    } else {
      // For previous dates, use the entry for that specific date
      if (
        entryForSelectedDate?.value !== undefined &&
        entryForSelectedDate.value > 0
      ) {
        setValue("value", entryForSelectedDate.value);
      } else {
        // If no entry exists for the selected date, set to 0
        setValue("value", 0);
      }
    }
  }, [latestEntry, entryForSelectedDate, setValue, isToday]);

  const handleDirectEdit = () => {
    setIsEditing(true);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      // Ensure the date is not in the future
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today

      if (date <= today) {
        setSelectedDate(date);
      } else {
        Alert.alert("Invalid Date", "You cannot add entries for future dates.");
      }
    }
  };

  const handleDateChangeTemp = (_: any, date?: Date) => {
    if (date) {
      setTempDate(date); // only update temp date, don't commit yet
    }
  };

  const confirmDate = () => {
    // Prevent future dates
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (tempDate <= today) {
      setSelectedDate(tempDate); // commit when Done is pressed
    } else {
      Alert.alert("Invalid Date", "You cannot add entries for future dates.");
    }

    setShowDatePicker(false);
  };

  const handleCreateEntry = async (data: FormSchema) => {
    try {
      await createMetricEntry({
        metricId: metricId as Id<"userMetrics">,
        value: data.value,
        dateFor: selectedDateString,
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
        <View className="py-4 flex-grow">
          <View className="px-4 pt-2 flex flex-row items-center justify-between">
            <View className="w-6" />

            <View className="flex-row items-center gap-3 mb-2">
              <View
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: metric.colour }}
              />
              <Text className="text-xl font-semibold text-gray-900">
                {metric.name}
              </Text>
            </View>

            <Pressable onPress={router.back}>
              <XMarkIcon size={24} color="#374151" />
            </Pressable>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 mt-4"
          >
            <View className="flex-1 px-6">
              {/* Date Selector */}
              <View className="items-center">
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="flex-row items-center gap-2 py-2 px-4 rounded-lg"
                  style={{
                    backgroundColor: color(metric.colour)
                      .mix(color("white"), 0.95)
                      .hex(),
                  }}
                >
                  <Feather name="calendar" size={16} color="#6B7280" />
                  <Text className="text-gray-700 font-medium">
                    {isToday ? "Today" : format(selectedDate, "EEEE, MMMM do")}
                  </Text>
                  <Feather name="chevron-down" size={16} color="#6B7280" />
                </TouchableOpacity>

                {!isToday && (
                  <Text className="text-xs text-gray-500 mt-1">
                    {format(selectedDate, "yyyy")}
                  </Text>
                )}
              </View>

              {/* Date Picker Modal */}
              {showDatePicker && Platform.OS === "ios" && (
                <TouchableWithoutFeedback
                  onPress={() => setShowDatePicker(false)}
                >
                  <View className="absolute inset-0 bg-black/50 flex-1 justify-center items-center z-50">
                    <TouchableWithoutFeedback
                      onPress={(e) => e.stopPropagation()}
                    >
                      <View className="bg-white rounded-md p-4 mx-4 shadow-lg">
                        <View className="flex-row justify-between items-center mb-4">
                          <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                          >
                            <Text className="text-blue-500 font-medium">
                              Cancel
                            </Text>
                          </TouchableOpacity>
                          <Text className="font-semibold text-gray-900">
                            Select Date
                          </Text>
                          <TouchableOpacity onPress={confirmDate}>
                            <Text className="text-blue-500 font-medium">
                              Done
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={tempDate}
                          mode="date"
                          display="spinner"
                          onChange={handleDateChangeTemp}
                          maximumDate={new Date()}
                          themeVariant="light"
                        />
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              )}

              {/* Android Date Picker */}
              {showDatePicker && Platform.OS === "android" && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()} // Prevent future dates
                  themeVariant="light"
                />
              )}

              {/* Value Selector */}
              <View className="flex-1 mt-8">
                <View
                  className="rounded-md p-1 mb-8 min-w-full"
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
                  <View className="mt-8 items-center mb-6">
                    {isEditing ? (
                      <Controller
                        control={control}
                        name="value"
                        render={({ field: { onChange, value } }) => (
                          <ValueInput
                            value={value}
                            onChange={onChange}
                            increment={increment}
                            colorHex={metric.colour}
                            setIsEditing={setIsEditing}
                          />
                        )}
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
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

type ValueInputProps = {
  value: number;
  onChange: (val: number) => void;
  increment: number;
  colorHex: string;
  setIsEditing: (editing: boolean) => void;
};

const ValueInput: React.FC<ValueInputProps> = ({
  value,
  onChange,
  increment,
  colorHex,
  setIsEditing,
}) => {
  const [inputText, setInputText] = useState(value.toString());

  // Only update inputText when value changes externally AND not editing
  useEffect(() => {
    setInputText(value.toString());
  }, [value]);

  const maxDecimals = increment < 1 ? Math.abs(Math.log10(increment)) : 0;

  const validateAndUpdate = (text: string) => {
    // Allow empty input
    if (text === "") {
      setInputText("");
      return;
    }

    // Allow only numbers + decimal
    if (!/^\d*\.?\d*$/.test(text)) return;

    const [_, decimal = ""] = text.split(".");
    if (decimal.length > maxDecimals) return;

    setInputText(text);
  };

  const commitValue = () => {
    // Only parse and round on commit
    let parsed = parseFloat(inputText);
    if (isNaN(parsed) || parsed < 0) parsed = 0;
    const rounded = formatValueByIncrement(parsed, increment);
    onChange(rounded as any);
    setInputText(rounded.toString());
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
        color: color(colorHex).mix(color("black"), 0.1).hex(),
        fontSize: 40,
        lineHeight: 48,
      }}
    />
  );
};
