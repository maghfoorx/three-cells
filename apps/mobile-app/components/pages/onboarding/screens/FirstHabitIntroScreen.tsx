import { View, Text, ScrollView } from "react-native";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import ProgressIndicator from "../ProgressIndicator";

interface FirstHabitIntroScreenProps {
  onNext: () => void;
}

export default function FirstHabitIntroScreen({
  onNext,
}: FirstHabitIntroScreenProps) {
  return (
    <OnboardingContainer backgroundColor="#ecfdf5">
      <View className="flex-1 px-6">
        <ProgressIndicator currentStep={6} totalSteps={12} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center my-8">
            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              Your First Habit
            </Text>

            <Text className="text-lg text-gray-600 text-center leading-relaxed">
              Let's create your first habit together. Remember, the goal isn't
              perfection - it's progress.
            </Text>
          </View>

          <View className="flex gap-3">
            <View className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                🎯 Start Small
              </Text>
              <Text className="text-gray-700 leading-relaxed">
                BJ Fogg's research at Stanford shows that tiny habits are more
                likely to stick. Think "2 push-ups" instead of "30-minute
                workout" to start.
              </Text>
            </View>

            <View className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                🔗 Stack It
              </Text>
              <Text className="text-gray-700 leading-relaxed">
                Attach your new habit to something you already do consistently.
                "After I brush my teeth, I will..." creates a natural trigger.
              </Text>
            </View>

            <View className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                🎉 Celebrate
              </Text>
              <Text className="text-gray-700 leading-relaxed">
                Immediately celebrate after completing your habit. This releases
                dopamine and helps your brain remember to repeat the behavior.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View className="pb-8">
          <OnboardingButton
            title="Create My First Habit"
            onPress={onNext}
            icon="plus"
          />
        </View>
      </View>
    </OnboardingContainer>
  );
}
