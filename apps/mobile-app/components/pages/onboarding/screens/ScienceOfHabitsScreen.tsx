import { View, Text, ScrollView, Image } from "react-native";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import ProgressIndicator from "../ProgressIndicator";

interface ScienceOfHabitsScreenProps {
  onNext: () => void;
}

export default function ScienceOfHabitsScreen({
  onNext,
}: ScienceOfHabitsScreenProps) {
  return (
    <OnboardingContainer backgroundColor="#fef3f2">
      <View className="flex-1 px-6">
        <ProgressIndicator currentStep={1} totalSteps={12} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-8">
            <View className="w-full mb-8">
              <Image
                source={require("../../../../assets/images/scienceOfHabits.png")}
                style={{
                  width: "100%",
                  height: 300, // or adjust based on your image's aspect ratio
                  objectFit: "contain",
                }}
              />
            </View>

            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              The Science of Habits
            </Text>
          </View>

          <View className="flex gap-4">
            <View className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                🔬 Research Shows
              </Text>
              <Text className="text-gray-700 leading-relaxed">
                MIT researchers discovered that habits are stored in the basal
                ganglia, a part of your brain that can function automatically.
                This means once a habit is formed, it requires minimal willpower
                to maintain.
              </Text>
            </View>

            <View className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                ⚡ The 21-Day Myth
              </Text>
              <Text className="text-gray-700 leading-relaxed">
                Dr. Phillippa Lally's study at University College London found
                that it actually takes an average of 66 days to form a new
                habit. The key? Consistency, not perfection.
              </Text>
            </View>

            <View className="bg-white rounded-md border border-gray-200 p-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                🎯 The Habit Loop
              </Text>
              <Text className="text-gray-700 leading-relaxed">
                Every habit follows a simple loop: Cue → Routine → Reward. Three
                Cells helps you identify and optimize each part of this loop for
                maximum success.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View className="pb-8">
          <OnboardingButton
            title="Continue Learning"
            onPress={onNext}
            icon="arrow-right"
          />
        </View>
      </View>
    </OnboardingContainer>
  );
}
