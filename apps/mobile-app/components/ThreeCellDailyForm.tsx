import { useForm, Controller } from "react-hook-form";
import clsx from "clsx";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Animated,
  SafeAreaView,
} from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { useEffect, useState } from "react";
import { format, parse } from "date-fns";

const formSchema = z.object({
  summary: z.string().min(1, "Summary is required"),
  focused_hours: z.number().min(0).max(24),
  score: z.number().min(-2).max(2),
  date_for: z.string().min(1),
});

const MOOD_OPTIONS = [
  {
    value: -2,
    emoji: "😭",
    color: "#FFB3BA",
    bgColor: "#FFF5F5",
    label: "Terrible",
  },
  {
    value: -1,
    emoji: "😞",
    color: "#FFDFBA",
    bgColor: "#FFFAF0",
    label: "Bad",
  },
  {
    value: 0,
    emoji: "😐",
    color: "#FFFFBA",
    bgColor: "#FFFFF0",
    label: "Okay",
  },
  {
    value: 1,
    emoji: "😊",
    color: "#BAFFC9",
    bgColor: "#F0FFF4",
    label: "Good",
  },
  {
    value: 2,
    emoji: "😁",
    color: "#BAE1FF",
    bgColor: "#F0F8FF",
    label: "Amazing",
  },
];

// Number Picker Modal Component
const NumberPickerModal = ({
  visible,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: number;
  onSelect: (value: number) => void;
  onClose: () => void;
}) => {
  const numbers = Array.from({ length: 25 }, (_, i) => i);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-500 text-lg font-medium">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">
              Focus Hours
            </Text>
            <TouchableOpacity onPress={() => onClose()}>
              <Text className="text-blue-500 text-lg font-medium">Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            className="max-h-60"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 20 }}
          >
            {numbers.map((num) => (
              <TouchableOpacity
                key={num}
                onPress={() => onSelect(num)}
                className={`py-4 px-6 mx-2 rounded-xl mb-2 ${
                  value === num ? "bg-blue-100" : "bg-gray-50"
                }`}
              >
                <Text
                  className={`text-center text-lg ${
                    value === num
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {num} {num === 1 ? "hour" : "hours"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function ThreeCellDailyForm({ date }: { date: Date }) {
  const parsedDate = format(date, "yyyy-MM-dd");
  console.log(format(parsedDate, "yyyy-MM-dd"), "IS_PARSED_DATE_NEW");
  const [showNumberPicker, setShowNumberPicker] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const data = useQuery(api.threeCells.threeCellForDate, {
    date: parsedDate,
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      summary: "",
      focused_hours: 0,
      score: 1,
      date_for: parsedDate,
    },
  });

  const selectedMood = watch("score");
  const currentMoodOption = MOOD_OPTIONS.find(
    (option) => option.value === selectedMood,
  );

  useEffect(() => {
    if (data) {
      reset({
        summary: data.summary,
        focused_hours: data.focusedHours,
        score: data.score,
        date_for: data.dateFor,
      });
    } else {
      reset({
        summary: "",
        focused_hours: 0,
        score: 0,
        date_for: parsedDate,
      });
    }
  }, [data, reset, parsedDate]);

  const submitThreeCellEntry = useMutation(api.threeCells.submitThreeCellEntry);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values, "ARE_VALUES_ON_SUBMIT");
    try {
      await submitThreeCellEntry({
        input: {
          summary: values.summary,
          focused_hours: values.focused_hours,
          score: values.score,
          date_for: format(values.date_for, "yyyy-MM-dd"),
        },
      });
    } catch (e) {
      console.error("Submission error:", e);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: currentMoodOption?.bgColor || "#FFFFFF",
      }}
    >
      <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-8">
          {/* <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      /> */}

          {/* Date Header */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-gray-800 mb-1">
              {format(parsedDate, "EEEE, MMM do")}
            </Text>
            <Text className="text-base text-gray-500">
              {format(parsedDate, "yyyy")}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {/* Mood Selection */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                How was your day?
              </Text>
              <Controller
                control={control}
                name="score"
                render={({ field }) => (
                  <View className="flex-row justify-between gap-2">
                    {MOOD_OPTIONS.map((mood) => {
                      const isSelected = field?.value === mood?.value;

                      const moodClasses = clsx(
                        "flex-1 items-center py-4 px-2 rounded-2xl border-2 min-h-20 justify-center",
                      );

                      return (
                        <TouchableOpacity
                          key={mood.value}
                          onPress={() => {
                            field.onChange(mood.value);
                          }}
                          className={moodClasses}
                          style={{
                            borderColor:
                              field?.value === mood?.value
                                ? "#D1D5DB"
                                : "#F3F4F6",
                            backgroundColor:
                              field.value === mood.value
                                ? mood.color
                                : "#FAFAFA",
                            transform: [
                              { scale: field.value === mood.value ? 1.02 : 1 },
                            ],
                          }}
                        >
                          <Text className="text-xl mb-1">{mood.emoji}</Text>
                          <Text
                            className={`text-xs text-center font-medium leading-tight ${
                              field.value === mood.value
                                ? "text-gray-700"
                                : "text-gray-500"
                            }`}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                          >
                            {mood.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              />
            </View>

            {/* Focus Hours */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Focus hours
              </Text>
              <Controller
                control={control}
                name="focused_hours"
                render={({ field }) => (
                  <>
                    <TouchableOpacity
                      onPress={() => setShowNumberPicker(true)}
                      className="flex-row items-center bg-white/70 rounded-2xl px-4 py-4 border border-gray-100"
                    >
                      <Text className="text-2xl font-bold text-gray-800 min-w-10 text-center">
                        {field.value}
                      </Text>
                      <Text className="text-base text-gray-600 ml-3 flex-1">
                        {field.value === 1 ? "hour" : "hours"} of deep work
                      </Text>
                      <Text className="text-gray-400">▼</Text>
                    </TouchableOpacity>

                    <NumberPickerModal
                      visible={showNumberPicker}
                      value={field.value}
                      onSelect={field.onChange}
                      onClose={() => setShowNumberPicker(false)}
                    />
                  </>
                )}
              />
            </View>

            {/* Daily Summary */}
            <View className="mb-8">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Daily reflection
              </Text>
              <Controller
                control={control}
                name="summary"
                render={({ field }) => (
                  <View>
                    <TextInput
                      multiline
                      placeholder="What happened today? Any wins, challenges, or insights?"
                      value={field.value}
                      onChangeText={field.onChange}
                      className="bg-white/70 rounded-2xl p-4 text-base text-gray-800 min-h-32 border border-gray-100"
                      placeholderTextColor="#9CA3AF"
                      textAlignVertical="top"
                      style={{ lineHeight: 22 }}
                    />
                    {errors.summary && (
                      <Text className="text-red-500 text-sm mt-2 ml-1">
                        {errors.summary.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className={`bg-gray-800 rounded-2xl py-4 items-center justify-center mb-8 ${
                isSubmitting ? "opacity-70" : ""
              }`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {isSubmitting ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white text-lg font-semibold">
                    Saving...
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Save Entry
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
