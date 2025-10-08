import { useForm, Controller } from "react-hook-form";
import {
  CalendarIcon,
  Square3Stack3DIcon,
} from "react-native-heroicons/outline";

import color from "color";
import clsx from "clsx";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Pressable,
  TouchableNativeFeedback,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StatusBar,
} from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import React, { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { router } from "expo-router";
import { SCORE_COLORS } from "@/utils/types";
import DailyHighlights from "./pages/track/DailyHighlights";
import LoadingScreen from "./LoadingScreen";
import { Image } from "expo-image";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const formSchema = z.object({
  summary: z.string().min(1, "Summary is required"),
  score: z.number().min(-2).max(2),
  date_for: z.string().min(1),
});

const MOOD_OPTIONS = [
  {
    value: -2,
    emoji: "😭",
    icon: require("../assets/images/terrible.png"),
    blurHash: "LFE1?Y%M00R*00R*R*R*R*R*R*", // mostly white with red hint
    color: SCORE_COLORS["-2"],
    label: "Terrible",
  },
  {
    value: -1,
    emoji: "😞",
    icon: require("../assets/images/bad.png"),
    blurHash: "LFF2?Y%M00R*00R*R*R*R*R*R*", // mostly white with orange hint
    color: SCORE_COLORS["-1"],
    label: "Bad",
  },
  {
    value: 0,
    emoji: "😐",
    icon: require("../assets/images/okay.png"),
    blurHash: "LFE3?Y%M00R*00R*R*R*R*R*R*", // mostly white with yellow hint
    color: SCORE_COLORS["0"],
    label: "Okay",
  },
  {
    value: 1,
    emoji: "😊",
    icon: require("../assets/images/good.png"),
    blurHash: "LFF4?Y%M00R*00R*R*R*R*R*R*", // mostly white with green hint
    color: SCORE_COLORS["1"],
    label: "Good",
  },
  {
    value: 2,
    emoji: "😁",
    icon: require("../assets/images/amazing.png"),
    blurHash: "LFE5?Y%M00R*00R*R*R*R*R*R*", // mostly white with bright green hint
    color: SCORE_COLORS["2"],
    label: "Amazing",
  },
];

// Simple working modal
function FullScreenTextEditor({
  visible,
  value,
  onChangeText,
  onClose,
  bgColor,
}: {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onClose: () => void;
  bgColor: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View
        style={{ flex: 1, backgroundColor: bgColor, paddingTop: insets.top }}
      >
        <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-200/30">
          <TouchableOpacity
            onPress={() => {
              console.log("Cancel button pressed");
              onClose();
            }}
            className="px-4 py-2 bg-gray-100/80 rounded-full"
          >
            <Text className="text-gray-700 font-semibold">Cancel</Text>
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-gray-900">
            Daily Reflection
          </Text>

          <TouchableOpacity
            onPress={() => {
              console.log("Done button pressed");
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 rounded-full"
          >
            <Text className="text-white font-semibold">Done</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="flex-1 px-6 py-6">
            <TextInput
              multiline
              value={value}
              onChangeText={onChangeText}
              placeholder="What happened today? Any wins, challenges, or insights?"
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-base text-gray-800"
              textAlignVertical="top"
              style={{
                fontFamily: "System",
                fontSize: 16,
                lineHeight: 24,
              }}
              scrollEnabled={true}
              autoFocus={true}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default function ThreeCellDailyForm({ date }: { date: Date }) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [showFullScreenEditor, setShowFullScreenEditor] = useState(false);
  const parsedDate = format(date, "yyyy-MM-dd");

  const handleOpenEditor = () => {
    console.log("handleOpenEditor called - opening modal");
    setShowFullScreenEditor(true);
  };

  const todayDate = format(new Date(), "yyyy-MM-dd");
  const isToday = todayDate === parsedDate;

  const navigateToToday = () => {
    router.replace(`/track/${todayDate}`);
  };

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
      score: 1,
      date_for: parsedDate,
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        summary: data.summary,
        score: data.score,
        date_for: data.dateFor,
      });
    } else {
      reset({
        summary: "",
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
          score: values.score,
          date_for: format(values.date_for, "yyyy-MM-dd"),
        },
      });
    } catch (e) {
      console.error("Submission error:", e);
    }
  };

  const bgColor = color(SCORE_COLORS[watch("score").toString()] ?? "#ffffff")
    .fade(0.8)
    .rgb()
    .string();

  if (data === undefined) {
    return <LoadingScreen pictureName="tracking-page-loading.png" />;
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: bgColor,
      }}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
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

          <View className="flex flex-row rounded-r-full rounded-l-full bg-white/80">
            <Pressable
              onPress={() => router.navigate("/three-cell-log")}
              className="w-12 h-12 items-center justify-center"
            >
              <Square3Stack3DIcon size={20} color="#6B7280" />
            </Pressable>
            <View className="my-2 border-[0.5px] border-gray-600"></View>
            <Pressable
              onPress={() => router.navigate("/yearly-view")}
              className="w-12 h-12 items-center justify-center"
            >
              <CalendarIcon size={20} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {!isToday && (
          <View className="px-6 mb-2">
            <TouchableOpacity
              onPress={navigateToToday}
              className="flex items-center justify-center bg-blue-200/80 py-2"
            >
              <Text>Go to today</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 32,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <DailyHighlights date={date} />

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
                      <View
                        key={mood.value}
                        className="flex flex-col items-center"
                      >
                        <TouchableNativeFeedback
                          onPress={() => {
                            field.onChange(mood.value);
                          }}
                        >
                          <View
                            className="flex items-center justify-center rounded-md"
                            style={{
                              backgroundColor: isSelected
                                ? mood.color
                                : "#FAFAFA",
                              shadowOffset: {
                                width: 0,
                                height: isSelected ? 4 : 2,
                              },
                              shadowOpacity: isSelected ? 0.2 : 0.05,
                              shadowRadius: isSelected ? 8 : 4,
                              elevation: isSelected ? 6 : 2,
                              minWidth: 60,
                              minHeight: 60,
                              height: 60,
                            }}
                          >
                            <Image
                              source={mood.icon}
                              style={{ width: 50, height: 50 }}
                              placeholder={{ blurhash: mood.blurHash }}
                              transition={200}
                              placeholderContentFit="contain"
                            />
                          </View>
                        </TouchableNativeFeedback>

                        <Text
                          className={`mt-0.5 text-xs text-center font-semibold leading-tight`}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                        >
                          {mood.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            />
          </View>

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
                  <TouchableOpacity
                    onPress={handleOpenEditor}
                    activeOpacity={0.7}
                  >
                    <View
                      className="bg-white/90 rounded-md border border-gray-100 min-h-48"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                    >
                      <View className="p-6">
                        {field.value ? (
                          <Text
                            className="text-base text-gray-800 leading-6"
                            style={{
                              fontFamily: "System",
                            }}
                          >
                            {field.value}
                          </Text>
                        ) : (
                          <Text
                            className="text-base text-gray-400 leading-6"
                            style={{
                              fontFamily: "System",
                            }}
                          >
                            What happened today? Any wins, challenges, or
                            insights?
                          </Text>
                        )}
                      </View>

                      {/* Tap to edit indicator */}
                      <View className="absolute top-3 right-3 bg-blue-100 px-2 py-1 rounded-full">
                        <Text className="text-blue-600 text-xs font-medium">
                          Tap to edit
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {errors.summary && (
                    <Text className="text-red-500 text-sm mt-3 ml-2">
                      {errors.summary.message}
                    </Text>
                  )}

                  {/* Full-screen text editor */}
                  <FullScreenTextEditor
                    visible={showFullScreenEditor}
                    value={field.value}
                    onChangeText={field.onChange}
                    onClose={() => {
                      console.log("Closing modal");
                      setShowFullScreenEditor(false);
                    }}
                    bgColor={bgColor}
                  />
                </View>
              )}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className={clsx(
              "bg-blue-600 rounded-md py-5 items-center justify-center mt-6",
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
