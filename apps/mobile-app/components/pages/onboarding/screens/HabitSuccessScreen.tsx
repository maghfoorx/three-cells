import { useEffect } from "react";
import { View, Text, Vibration } from "react-native";
import { Feather } from "@expo/vector-icons";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import ProgressIndicator from "../ProgressIndicator";

interface HabitSuccessScreenProps {
  onNext: () => void;
  habitName: string;
}

export default function HabitSuccessScreen({
  onNext,
  habitName,
}: HabitSuccessScreenProps) {
  useEffect(() => {
    // Trigger celebration vibration
    const celebrationPattern = [100, 50, 100, 50, 200];
    Vibration.vibrate(celebrationPattern);
  }, []);

  return (
    <OnboardingContainer backgroundColor="#f0fdf4">
      <View className="flex-1 px-6">
        <ProgressIndicator currentStep={8} totalSteps={12} />

        <View className="flex-1 justify-center items-center">
          {/* Confetti Animation Area */}
          <View className="items-center mb-8">
            <View className="bg-green-100 rounded-full p-8 mb-6 relative">
              <Text className="text-6xl">🎉</Text>
              {/* Simulated confetti with emojis */}
              <Text className="absolute -top-2 -left-2 text-2xl animate-bounce">
                ✨
              </Text>
              <Text className="absolute -top-2 -right-2 text-2xl animate-bounce delay-100">
                🎊
              </Text>
              <Text className="absolute -bottom-2 -left-2 text-2xl animate-bounce delay-200">
                ⭐
              </Text>
              <Text className="absolute -bottom-2 -right-2 text-2xl animate-bounce delay-300">
                🌟
              </Text>
            </View>

            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              Congratulations!
            </Text>

            <Text className="text-xl text-gray-700 text-center mb-6 leading-relaxed">
              You've just created your first habit:
            </Text>

            <View className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
              <Text className="text-lg font-semibold text-green-800 text-center">
                "{habitName}"
              </Text>
            </View>
          </View>

          <View className="bg-green-50 rounded-xl p-6 border border-green-200 mb-8">
            <View className="flex-row items-center mb-3">
              <Feather name="check-circle" size={20} color="#059669" />
              <Text className="text-lg font-semibold text-green-800 ml-2">
                You're on the right track!
              </Text>
            </View>
            <Text className="text-green-700 leading-relaxed">
              Research shows that the simple act of committing to a habit
              increases your likelihood of success by 65%. You've already taken
              the hardest step.
            </Text>
          </View>

          <View className="bg-white rounded-xl p-6 shadow-sm">
            <Text className="text-sm text-gray-500 text-center italic">
              "A journey of a thousand miles begins with a single step."
            </Text>
            <Text className="text-sm text-gray-400 text-center mt-2">
              — Lao Tzu
            </Text>
          </View>
        </View>

        <View className="pb-8">
          <OnboardingButton
            title="Continue Setup"
            onPress={onNext}
            icon="arrow-right"
          />
        </View>
      </View>
    </OnboardingContainer>
  );
}
