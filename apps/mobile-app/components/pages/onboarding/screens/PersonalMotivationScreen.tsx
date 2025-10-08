import { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  InputAccessoryView,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import ProgressIndicator from "../ProgressIndicator";

const KEYBOARD_TOOLBAR_ID = "keyboard_toolbar_personal_motivation";

interface PersonalMotivationScreenProps {
  onNext: (motivation: string) => void;
}

export default function PersonalMotivationScreen({
  onNext,
}: PersonalMotivationScreenProps) {
  const [motivation, setMotivation] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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

  const handleMotivationChange = useCallback(
    (text: string) => {
      setMotivation(text);
      if (isKeyboardVisible) {
        handleScrollToInput();
      }
    },
    [isKeyboardVisible, handleScrollToInput],
  );

  const handleNext = () => {
    onNext(motivation);
  };

  return (
    <OnboardingContainer backgroundColor="#fefce8">
      <View className="flex-1 px-6">
        <ProgressIndicator currentStep={4} totalSteps={12} />

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
              paddingBottom: isKeyboardVisible ? 250 : 32,
            }}
          >
            <View className="items-center my-8">
              <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Drives You?
              </Text>

              <Text className="text-lg text-gray-600 text-center leading-relaxed">
                Understanding your "why" is crucial for lasting change. Research
                shows that intrinsic motivation is 3x more powerful than
                external rewards.
              </Text>
            </View>

            <View className="bg-white rounded-md border border-gray-200 p-6 shadow-sm mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Complete this sentence:
              </Text>
              <Text className="text-base text-gray-700 mb-4">
                "I want to build better habits because..."
              </Text>

              <TextInput
                ref={textInputRef}
                className="border border-gray-300 rounded-md p-4 text-base min-h-[120px] bg-gray-50"
                placeholder="I want to feel more confident, have more energy, be a better role model for my family..."
                multiline
                textAlignVertical="top"
                value={motivation}
                onChangeText={handleMotivationChange}
                autoFocus
                scrollEnabled={false}
                onFocus={() => {
                  setIsKeyboardVisible(true);
                  handleScrollToInput();
                }}
                onBlur={() => {
                  Keyboard.dismiss();
                  setIsKeyboardVisible(false);
                }}
                inputAccessoryViewID={
                  Platform.OS === "ios" ? KEYBOARD_TOOLBAR_ID : undefined
                }
              />
            </View>

            <View className="bg-blue-50 rounded-md p-6 border border-blue-200">
              <Text className="text-sm text-blue-800 font-medium mb-2">
                💡 Pro Tip
              </Text>
              <Text className="text-sm text-blue-700">
                The more specific and personal your reason, the stronger your
                motivation will be during challenging moments. This becomes your
                North Star.
              </Text>
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
                backgroundColor: "#fefce8",
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
          {motivation.trim().length < 10 && (
            <Text className="text-center text-gray-600 mb-1">
              {10 - motivation.trim().length} characters remaining
            </Text>
          )}
          <OnboardingButton
            title="Continue"
            onPress={handleNext}
            icon="arrow-right"
            disabled={motivation.trim().length < 10}
          />
        </View>
      </View>
    </OnboardingContainer>
  );
}
