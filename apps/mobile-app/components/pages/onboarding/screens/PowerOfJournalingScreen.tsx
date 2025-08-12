import { View, Text, ScrollView } from "react-native";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import ProgressIndicator from "../ProgressIndicator";

interface PowerOfJournalingScreenProps {
  onNext: () => void;
}

export default function PowerOfJournalingScreen({
  onNext,
}: PowerOfJournalingScreenProps) {
  return (
    <OnboardingContainer backgroundColor="#f0f9ff">
      <View className="flex-1 px-6">
        <ProgressIndicator currentStep={2} totalSteps={12} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-8">
            <View className="bg-blue-100 rounded-full p-8 mb-6">
              <Text className="text-6xl">📝</Text>
            </View>

            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              The Power of Journaling
            </Text>
          </View>

          <View className="space-y-6">
            <View className="bg-white rounded-xl p-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                🧘 Mental Health Benefits
              </Text>
              <Text className="text-gray-700 leading-relaxed">
                UCLA research shows that writing about emotions activates the
                prefrontal cortex, reducing activity in the amygdala (fear
                center). Just 15-20 minutes of journaling can significantly
                reduce stress and anxiety.
              </Text>
            </View>

            <View className="bg-white rounded-xl p-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                🎯 Goal Achievement
              </Text>
              <Text className="text-gray-700 leading-relaxed">
                Dr. Gail Matthews' study found that people who write down their
                goals are 42% more likely to achieve them. Journaling creates
                clarity and accountability for your aspirations.
              </Text>
            </View>

            <View className="bg-white rounded-xl p-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                💡 Enhanced Self-Awareness
              </Text>
              <Text className="text-gray-700 leading-relaxed">
                Regular reflection through journaling helps you identify
                patterns, triggers, and opportunities for growth. It's like
                having a conversation with your wisest self.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View className="pb-8">
          <OnboardingButton
            title="Discover More"
            onPress={onNext}
            icon="arrow-right"
          />
        </View>
      </View>
    </OnboardingContainer>
  );
}
