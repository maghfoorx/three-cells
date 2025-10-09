import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Vibration,
  KeyboardAvoidingView,
  Platform,
  InputAccessoryView,
  Keyboard,
} from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import clsx from "clsx";
import color from "color";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import ProgressIndicator from "../ProgressIndicator";
import { useMutation } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";

const formSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  colour: z.string().min(1),
  habitQuestion: z.string().min(1, "Question is required"),
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

const KEYBOARD_TOOLBAR_ID = "keyboard_toolbar_create_habit";

const getRandomColourForNewHabit = () => {
  return habitsFormColourOptions[
    Math.floor(Math.random() * habitsFormColourOptions.length)
  ];
};

interface CreateHabitScreenProps {
  onNext: (habitData: FormSchema) => void;
}

export default function CreateHabitScreen({ onNext }: CreateHabitScreenProps) {
  const createNewHabit = useMutation(api.habits.createNewUserHabit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      habitQuestion: "",
      colour: getRandomColourForNewHabit(),
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const selectedColour = watch("colour");

  const pageColour = useMemo(() => {
    return color(selectedColour).mix(color("white"), 0.85).hex();
  }, [selectedColour]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  const handleScrollToInput = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);
    // Add extra scroll after keyboard animation
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    }, 400);
  }, []);

  const handleCreateHabit = async (data: FormSchema) => {
    setIsSubmitting(true);

    await createNewHabit({
      name: data.name,
      habitQuestion: data.habitQuestion,
      colour: data.colour,
    });

    // Trigger vibration for success feedback
    Vibration.vibrate([100, 50, 100]);

    setIsSubmitting(false);
    onNext(data);
  };

  return (
    <OnboardingContainer backgroundColor={pageColour}>
      <View className="flex-1 px-6">
        <ProgressIndicator currentStep={7} totalSteps={12} />

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: isKeyboardVisible ? 300 : 54,
            }}
          >
            <View className="items-center my-8">
              <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
                Create Your First Habit
              </Text>

              <Text className="text-lg text-gray-600 text-center leading-relaxed">
                Make it specific, make it yours.
              </Text>
            </View>

            <View className="flex gap-4">
              {/* Name Field */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Habit Name*
                </Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="border bg-white border-gray-300 p-4 rounded-md"
                      placeholder="e.g., Morning meditation, Daily walk, Read 5 pages"
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

              {/* Question Field */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Daily Check-in Question*
                </Text>
                <Controller
                  control={control}
                  name="habitQuestion"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className="border bg-white border-gray-300 rounded-md p-4 min-h-[100px]"
                      placeholder="e.g., Did I meditate for 5 minutes today? Did I take a 10-minute walk?"
                      multiline
                      textAlignVertical="top"
                      onBlur={() => {
                        onBlur();
                        Keyboard.dismiss();
                        setIsKeyboardVisible(false);
                      }}
                      onChangeText={(text) => {
                        onChange(text);
                        if (isKeyboardVisible) {
                          handleScrollToInput();
                        }
                      }}
                      value={value}
                      autoComplete="off"
                      scrollEnabled={false}
                      onFocus={() => {
                        setIsKeyboardVisible(true);
                        handleScrollToInput();
                      }}
                      inputAccessoryViewID={
                        Platform.OS === "ios" ? KEYBOARD_TOOLBAR_ID : undefined
                      }
                    />
                  )}
                />
                {errors.habitQuestion && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.habitQuestion.message}
                  </Text>
                )}
              </View>

              {/* Colour Field */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Choose a Color*
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {habitsFormColourOptions.map((habitColour) => (
                    <TouchableOpacity
                      key={habitColour}
                      onPress={() => setValue("colour", habitColour)}
                      className={clsx("h-8 w-8 rounded-md border-2", {
                        "border-gray-900": habitColour === selectedColour,
                        "border-gray-100": habitColour !== selectedColour,
                      })}
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

              <View className="bg-blue-50 rounded-md p-4 border border-blue-200">
                <Text className="text-sm text-blue-800 font-medium mb-2">
                  💡 Remember
                </Text>
                <Text className="text-sm text-blue-700">
                  Start with something so small you cannot fail. You can always
                  increase the difficulty once the habit becomes automatic.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Keyboard Toolbar (iOS only) */}
          {Platform.OS === "ios" && (
            <InputAccessoryView nativeID={KEYBOARD_TOOLBAR_ID}>
              <View
                className="flex-row justify-end items-center px-4 py-2"
                style={{
                  minHeight: 44,
                  backgroundColor: "transparent",
                }}
              >
                <TouchableOpacity
                  onPress={() => Keyboard.dismiss()}
                  className="px-4 py-2 bg-blue-600 rounded-full"
                  style={{
                    shadowColor: "#3B82F6",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text className="text-white font-semibold text-base">
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </InputAccessoryView>
          )}

          {/* Android Keyboard Toolbar */}
          {Platform.OS === "android" && isKeyboardVisible && (
            <View
              className="absolute bottom-0 left-0 right-0 flex-row justify-end items-center px-4 py-2 border-t border-gray-200"
              style={{
                minHeight: 44,
                backgroundColor: pageColour,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setIsKeyboardVisible(false);
                }}
                className="px-4 py-2 bg-blue-600 rounded-md"
                style={{
                  shadowColor: "#3B82F6",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text className="text-white font-semibold text-base">Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>

        <View className="pb-8">
          <OnboardingButton
            title={isSubmitting ? "Creating..." : "Create My Habit"}
            onPress={handleSubmit(handleCreateHabit)}
            icon="plus-circle"
            loading={isSubmitting}
          />
        </View>
      </View>
    </OnboardingContainer>
  );
}
