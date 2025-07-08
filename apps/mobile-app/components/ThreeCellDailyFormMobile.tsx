import { useForm, Controller } from "react-hook-form";
import { CalendarIcon } from "react-native-heroicons/outline";

import color from "color";
import clsx from "clsx";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  SafeAreaView,
  Pressable,
} from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { router, useRouter } from "expo-router";
import { SCORE_COLORS } from "@/utils/types";
import { Feather } from "@expo/vector-icons";

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
    color: SCORE_COLORS["-2"],
    label: "Terrible",
  },
  {
    value: -1,
    emoji: "😞",
    color: SCORE_COLORS["-1"],
    label: "Bad",
  },
  {
    value: 0,
    emoji: "😐",
    color: SCORE_COLORS["0"],
    label: "Okay",
  },
  {
    value: 1,
    emoji: "😊",
    color: SCORE_COLORS["1"],
    label: "Good",
  },
  {
    value: 2,
    emoji: "😁",
    color: SCORE_COLORS["2"],
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
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-600 text-base font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Focus Hours</Text>
            <TouchableOpacity onPress={() => onClose()}>
              <Text className="text-blue-600 text-base font-medium">Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            className="max-h-80"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
          >
            {numbers.map((num) => (
              <TouchableOpacity
                key={num}
                onPress={() => onSelect(num)}
                className={clsx(
                  "py-4 px-6 mx-2 mb-2 rounded-md",
                  value === num
                    ? "bg-blue-50 border-2 border-blue-200"
                    : "bg-gray-50",
                )}
              >
                <Text
                  className={`text-center text-lg ${
                    value === num
                      ? "text-blue-700 font-semibold"
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
  const [showNumberPicker, setShowNumberPicker] = useState(false);

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

  const bgColor = color(SCORE_COLORS[watch("score").toString()] ?? "#ffffff")
    .fade(0.95)
    .rgb()
    .string();

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: bgColor,
      }}
    >
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 flex flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              {format(parsedDate, "EEEE")}
            </Text>
            <Text className="text-base text-gray-500 mt-1">
              {format(parsedDate, "MMMM do, yyyy")}
            </Text>
          </View>

          <Pressable
            onPress={() => router.navigate("/yearly-view")}
            className="w-12 h-12 rounded-md bg-white/80 items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <CalendarIcon size={20} color="#6B7280" />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        >
          {/* Mood Selection */}
          <View className="mt-8">
            <Text className="font-semibold text-gray-900 mb-4">
              How was your day?
            </Text>
            <Controller
              control={control}
              name="score"
              render={({ field }) => (
                <View className="flex-row justify-between gap-3">
                  {MOOD_OPTIONS.map((mood) => {
                    const isSelected = field?.value === mood?.value;

                    return (
                      <TouchableOpacity
                        key={mood.value}
                        onPress={() => {
                          field.onChange(mood.value);
                        }}
                        className={clsx(
                          "flex-1 items-center py-6 px-2 rounded-md border-2 min-h-24 justify-center",
                        )}
                        style={{
                          borderColor: isSelected ? mood.color : "#F3F4F6",
                          backgroundColor: isSelected ? mood.color : "#FAFAFA",
                          shadowColor: isSelected ? mood.color : "#000",
                          shadowOffset: {
                            width: 0,
                            height: isSelected ? 4 : 2,
                          },
                          shadowOpacity: isSelected ? 0.2 : 0.05,
                          shadowRadius: isSelected ? 8 : 4,
                          elevation: isSelected ? 6 : 2,
                        }}
                      >
                        <Text className="text-2xl mb-2">{mood.emoji}</Text>
                        <Text
                          className={`text-xs text-center font-semibold leading-tight ${
                            isSelected
                              ? color(mood.color).isLight()
                                ? "text-gray-800"
                                : "text-white"
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
          {/* <View className="mt-12">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Focus hours
            </Text>
            <Controller
              control={control}
              name="focused_hours"
              render={({ field }) => (
                <>
                  <TouchableOpacity
                    onPress={() => setShowNumberPicker(true)}
                    className="flex-row items-center bg-white/90 rounded-md px-6 py-5 border border-gray-100"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <View className="w-16 h-16 rounded-md bg-blue-50 items-center justify-center mr-4">
                      <Text className="text-2xl font-bold text-blue-600">
                        {field.value}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-gray-900">
                        {field.value === 1 ? "hour" : "hours"}
                      </Text>
                      <Text className="text-sm text-gray-500 mt-1">
                        of deep work today
                      </Text>
                    </View>
                    <View className="w-6 h-6 rounded-full bg-gray-100 items-center justify-center">
                      <Text className="text-gray-400 text-xs">▼</Text>
                    </View>
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
          </View> */}

          {/* Daily Summary */}
          <View className="mt-12">
            <Text className="font-semibold text-gray-900 mb-4">
              Daily reflection
            </Text>
            <Controller
              control={control}
              name="summary"
              render={({ field }) => (
                <View>
                  <View
                    className="bg-white/90 rounded-md border border-gray-100"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <TextInput
                      multiline
                      placeholder="What happened today? Any wins, challenges, or insights?"
                      value={field.value}
                      onChangeText={field.onChange}
                      className="p-6 text-base text-gray-800 min-h-48"
                      placeholderTextColor="#9CA3AF"
                      textAlignVertical="top"
                      style={{
                        lineHeight: 24,
                        fontFamily: "System",
                      }}
                    />
                  </View>
                  {errors.summary && (
                    <Text className="text-red-500 text-sm mt-3 ml-2">
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
            className={clsx(
              "bg-blue-600 rounded-md py-5 items-center justify-center mt-12",
              isSubmitting ? "opacity-70" : "",
            )}
            style={{
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {isSubmitting ? (
              <View className="flex-row items-center gap-3">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white text-lg font-bold">Saving...</Text>
              </View>
            ) : (
              <Text className="text-white text-lg font-bold">Save Entry</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
