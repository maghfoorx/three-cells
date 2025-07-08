import { useForm, Controller } from "react-hook-form";
import { CalendarIcon } from "react-native-heroicons/outline";

import color from "color";
import { useNavigation } from "@react-navigation/native";
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
  Pressable,
  Dimensions,
  TouchableWithoutFeedback,
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
        <View className="bg-white rounded-t-sm p-6">
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
                className={clsx(
                  "py-4 px-6 mx-2 rounded-sm",
                  value === num ? "bg-blue-100" : "bg-gray-50",
                )}
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

// Burger Menu Modal Component
const BurgerMenuModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const router = useRouter();

  const goToYearlyView = () => {
    router.navigate("/yearly-view");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-sm p-6">
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-blue-500 text-lg font-medium">Close</Text>
            </TouchableOpacity>
          </View>
          <View className="py-4 pb-40">
            <TouchableOpacity
              onPress={goToYearlyView}
              className="py-4 px-6 mx-2 rounded-sm bg-gray-50"
            >
              <View className="flex flex-row gap-2 items-center justify-center">
                <Feather name="calendar" size={20} />
                <Text className="text-center text-lg text-gray-700">
                  Yearly view
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function ThreeCellDailyForm({ date }: { date: Date }) {
  function openMenu() {
    setShowBuggerMenu(true);
  }

  const parsedDate = format(date, "yyyy-MM-dd");
  const [showNumberPicker, setShowNumberPicker] = useState(false);
  const [showBuggerMenu, setShowBuggerMenu] = useState(false);

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
    .fade(0.9)
    .rgb()
    .string();

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: bgColor,
      }}
    >
      <View className="p-4 flex-1">
        {/* Date Header */}
        <View className="flex flex-row justify-between">
          <View className="items-left">
            <Text className="text-2xl font-bold text-gray-800">
              {format(parsedDate, "EEEE, MMM do")}
            </Text>
            <Text className="text-base text-gray-500">
              {format(parsedDate, "yyyy")}
            </Text>
          </View>

          <View>
            {/* Burger menu button */}
            <Pressable
              onPress={() => router.navigate("/yearly-view")}
              className="p-2 border border-gray-300 rounded-lg"
              style={{
                backgroundColor: "white",
              }}
            >
              <CalendarIcon size={16} />
            </Pressable>
          </View>
        </View>
        <BurgerMenuModal
          onClose={() => setShowBuggerMenu(false)}
          visible={showBuggerMenu}
        />
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Mood Selection */}
          <View className="mt-8 flex gap-2">
            <Text className="text-lg font-semibold text-gray-800">
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
                      "flex-1 items-center py-4 px-2 rounded-sm border-2 min-h-20 justify-center",
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
                            field.value === mood.value ? "#D1D5DB" : "#F3F4F6",
                          backgroundColor:
                            field.value === mood.value ? mood.color : "#FAFAFA",
                          transform: [
                            { scale: field.value === mood.value ? 1.02 : 1 },
                          ],
                        }}
                      >
                        <Text className="text-xl">{mood.emoji}</Text>
                        <Text
                          className={`mt-1 text-xs text-center font-medium leading-tight ${
                            field.value === mood.value
                              ? color(mood.color).isLight()
                                ? "text-gray-800"
                                : "text-gray-100"
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
          <View className="mt-4 flex gap-2">
            <Text className="text-lg font-semibold text-gray-800">
              Focus hours
            </Text>
            <Controller
              control={control}
              name="focused_hours"
              render={({ field }) => (
                <>
                  <TouchableOpacity
                    onPress={() => setShowNumberPicker(true)}
                    className="flex-row items-center bg-white/70 rounded-sm px-4 py-4 border border-gray-100"
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
          <View className="mt-4 flex gap-2">
            <Text className="text-lg font-semibold text-gray-800">
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
                    className="bg-white/70 rounded-sm p-4 text-base text-gray-800 min-h-44 border border-gray-100"
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
            className={clsx(
              "bg-primary rounded-sm py-4 items-center justify-center mt-6",
              isSubmitting ? "opacity-70" : "",
            )}
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
    </SafeAreaView>
  );
}
