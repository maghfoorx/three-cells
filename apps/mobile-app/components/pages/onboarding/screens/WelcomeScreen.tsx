import { View, Text } from "react-native";
import { Image } from "expo-image";
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
          <View className="w-full px-4 mb-8">
            <Image
              source={require("../../../../assets/images/welcome.png")}
              style={{
                width: "100%",
                height: 200, // or adjust based on your image's aspect ratio
                objectFit: "contain",
              }}
            />
          </View>
          <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
            Congratulations on Taking the First Step!
          </Text>
          <Text className="text-lg text-gray-600 text-center mb-8 leading-relaxed">
            You've made an incredible decision to invest in yourself. Your
            journey to building lasting habits, meaningful reflection, and
            tracking your progress starts right now. This is already an
            accomplishment worth celebrating – you're here, you're committed,
            and you're ready to grow.
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
