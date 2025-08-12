import { View, Text, ScrollView } from "react-native";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import ProgressIndicator from "../ProgressIndicator";

interface TrackingMetricsScreenProps {
  onNext: () => void;
}

export default function TrackingMetricsScreen({
  onNext,
}: TrackingMetricsScreenProps) {
  return (
    <OnboardingContainer backgroundColor="#f0fdf4">
      <View className="flex-1 px-6">
        <ProgressIndicator currentStep={3} totalSteps={12} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-8">
            <View className="bg-green-100 rounded-full p-8 mb-6">
              <Text className="text-6xl">📊</Text>
            </View>

            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              Why Tracking Works
            </Text>
          </View>

          <View className="space-y-6">
            <View className="bg-white rounded-xl p-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                📈 The Hawthorne Effect
              </Text>
              <Text className="text-gray-700 leading-relaxed">
                Simply measuring something changes behavior. Studies show that
                people who track their progress are 2x more likely to reach
                their goals, even without additional interventions.
              </Text>
            </View>

            <View className="bg-white rounded-xl p-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                🎯 Dopamine & Progress
              </Text>
              <Text className="text-gray-700 leading-relaxed">
                Neuroscientist Dr. Anna Wise found that tracking progress
                releases dopamine, the same neurotransmitter associated with
                pleasure and motivation. Each small win builds momentum for
                bigger achievements.
              </Text>
            </View>

            <View className="bg-white rounded-xl p-6 shadow-sm">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                🔍 Data-Driven Insights
              </Text>
              <Text className="text-gray-700 leading-relaxed">
                Tracking reveals patterns you might miss otherwise. Sleep
                affects mood, exercise impacts focus, and small daily actions
                compound into life-changing results over time.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View className="pb-8">
          <OnboardingButton
            title="Let's Get Personal"
            onPress={onNext}
            icon="arrow-right"
          />
        </View>
      </View>
    </OnboardingContainer>
  );
}
