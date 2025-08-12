import { View, Text } from "react-native";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import ProgressIndicator from "../ProgressIndicator";

interface WelcomeScreenProps {
  onNext: () => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <OnboardingContainer backgroundColor="#f8fafc">
      <View className="flex-1 px-6">
        <ProgressIndicator currentStep={0} totalSteps={12} />

        <View className="flex-1 justify-center items-center">
          <View className="bg-blue-100 rounded-full p-8 mb-8">
            <Text className="text-6xl">🌱</Text>
          </View>

          <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
            Welcome to Three Cells
          </Text>

          <Text className="text-lg text-gray-600 text-center mb-8 leading-relaxed">
            Your journey to becoming the best version of yourself starts here.
            In just a few minutes, you'll discover the science-backed approach
            to building lasting habits, meaningful reflection, and measurable
            progress.
          </Text>

          <View className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <Text className="text-sm text-gray-500 text-center italic">
              "We are what we repeatedly do. Excellence, then, is not an act,
              but a habit."
            </Text>
            <Text className="text-sm text-gray-400 text-center mt-2">
              — Aristotle
            </Text>
          </View>
        </View>

        <View className="pb-8">
          <OnboardingButton
            title="Begin Your Journey"
            onPress={onNext}
            icon="arrow-right"
          />
        </View>
      </View>
    </OnboardingContainer>
  );
}
